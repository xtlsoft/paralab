package cache

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/lcpu-club/paralab/packages/paraci/agent/fs"
)

type Cache struct {
	Directory   string `yaml:"directory"`
	CacheEnable bool   `yaml:"cacheEnable"`
}

var errInvalidCacheType = errors.New("invalid cache type")

const (
	// OciTempCacheType specifies the cache holds SIF images created from OCI sources
	OciCacheType = "oci"
	// OciBlobCacheType specifies the cache holds OCI blobs (layers) pulled from OCI sources
	OciBlobCacheType = "blob"
)

var (
	// FileCacheTypes specifies the file cache types.
	FileCacheTypes = []string{
		OciCacheType,
		OciBlobCacheType,
	}
	// OciCacheTypes specifies the OCI cache types.
	OciCacheTypes = []string{
		OciBlobCacheType,
	}
)

func stringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

// Return the directory for a specific CacheType
func (c *Cache) getCacheTypeDir(cacheType string) string {
	return path.Join(c.Directory, cacheType)
}

func (c *Cache) GetFileCacheDir(cacheType string) (cacheDir string, err error) {
	if !stringInSlice(cacheType, FileCacheTypes) {
		return "", fmt.Errorf("invalid cache type: %s", cacheType)
	}
	return c.getCacheTypeDir(cacheType), nil
}

func (c *Cache) GetOciCacheDir(cacheType string) (cacheDir string, err error) {
	if !stringInSlice(cacheType, OciCacheTypes) {
		return "", errInvalidCacheType
	}
	return c.getCacheTypeDir(cacheType), nil
}

// GetEntry returns a cache Entry for a specified file cache type and hash
func (c *Cache) GetEntry(cacheType string, hash string) (e *Entry, err error) {
	if !c.CacheEnable {
		return nil, nil
	}

	e = &Entry{}

	cacheDir, err := c.GetFileCacheDir(cacheType)
	if err != nil {
		return nil, fmt.Errorf("cannot get '%s' cache directory: %v", cacheType, err)
	}

	e.Path = filepath.Join(cacheDir, hash)

	// If there is a directory it's from an older version of Apptainer
	// We need to remove it as we work with single files per hash only now
	if fs.IsDir(e.Path) {
		log.Printf("Removing old cache directory: %s", e.Path)
		err := os.RemoveAll(e.Path)
		// Allow IsNotExist in case a concurrent process already removed it
		if err != nil && !os.IsNotExist(err) {
			return nil, fmt.Errorf("could not remove old cache directory '%s': %v", e.Path, err)
		}
	}

	// If there is no existing file return an entry with a TmpPath for the caller
	// to use and then Finalize
	pathExists, err := fs.PathExists(e.Path)
	if err != nil {
		return nil, fmt.Errorf("could not check for cache entry '%s': %v", e.Path, err)
	}

	if !pathExists {
		e.Exists = false
		f, err := fs.MakeTmpFile(cacheDir, "tmp_", 0o700)
		if err != nil {
			return nil, err
		}
		err = f.Close()
		if err != nil {
			return nil, err
		}
		e.TmpPath = f.Name()
		return e, nil
	}

	// Double check that there isn't something else weird there
	if !fs.IsFile(e.Path) {
		return nil, fmt.Errorf("path '%s' exists but is not a file", e.Path)
	}

	// It exists in the cache and it's a file. Caller can use the Path directly
	e.Exists = true
	return e, nil
}

func (c *Cache) CleanCache(cacheType string, dryRun bool, days int) (err error) {
	dir := c.getCacheTypeDir(cacheType)

	files, err := os.ReadDir(dir)
	if (err != nil && os.IsNotExist(err)) || len(files) == 0 {
		log.Printf("No cached files to remove at %s", dir)
		return nil
	}

	errCount := 0
	for _, f := range files {
		if days >= 0 {
			fi, err := f.Info()
			if err != nil {
				log.Fatalf("Could not get info for cache entry '%s': %v", f.Name(), err)
				errCount = errCount + 1
				continue
			}

			if time.Since(fi.ModTime()) < time.Duration(days*24)*time.Hour {
				log.Printf("Skipping %s: less that %d days old", f.Name(), days)
				continue
			}
		}

		log.Printf("Removing %s cache entry: %s", cacheType, f.Name())
		if !dryRun {
			// We RemoveAll in case the entry is a directory from Singularity (prior to 3.6)
			err := os.RemoveAll(path.Join(dir, f.Name()))
			if err != nil {
				log.Fatalf("Could not remove cache entry '%s': %v", f.Name(), err)
				errCount = errCount + 1
			}
		}
	}

	if errCount > 0 {
		return fmt.Errorf("failed to remove %d cache entries", errCount)
	}

	return err
}

func initCacheDir(dir string) error {
	if fi, err := os.Stat(dir); os.IsNotExist(err) {
		log.Printf("Creating cache directory: %s", dir)
		if err := fs.MkdirAll(dir, 0o700); err != nil {
			return fmt.Errorf("couldn't create cache directory %v: %v", dir, err)
		}
	} else if err != nil {
		return fmt.Errorf("unable to stat %s: %s", dir, err)
	} else if fi.Mode().Perm() != 0o700 {
		// enforce permission on cache directory to prevent
		// potential information leak
		if err := os.Chmod(dir, 0o700); err != nil {
			return fmt.Errorf("couldn't enforce permission 0700 on %s: %s", dir, err)
		}
	}
	for _, kind := range FileCacheTypes {
		cacheDir := path.Join(dir, kind)
		if fi, err := os.Stat(cacheDir); os.IsNotExist(err) {
			log.Printf("Creating cache directory: %s", cacheDir)
			if err := fs.MkdirAll(cacheDir, 0o700); err != nil {
				return fmt.Errorf("couldn't create cache directory %v: %v", cacheDir, err)
			}
		} else if err != nil {
			return fmt.Errorf("unable to stat %s: %s", cacheDir, err)
		} else if !fi.Mode().IsDir() {
			return fmt.Errorf("cache directory %s is not a directory", cacheDir)
		} else if fi.Mode().Perm() != 0o700 {
			// enforce permission on cache directory to prevent
			// potential information leak
			if err := os.Chmod(cacheDir, 0o700); err != nil {
				return fmt.Errorf("couldn't enforce permission 0700 on %s: %s", cacheDir, err)
			}
		}
	}

	return nil
}

func (c *Cache) InitCache() error {
	log.Println("init cache...")
	return initCacheDir(c.Directory)
}
