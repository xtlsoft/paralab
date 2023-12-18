package fs

import (
	"fmt"
	"os"
	"syscall"
)

// IsFile check if name component is regular file.
func IsFile(name string) bool {
	info, err := os.Stat(name)
	if err != nil {
		return false
	}
	return info.Mode().IsRegular()
}

// IsDir check if name component is a directory.
func IsDir(name string) bool {
	info, err := os.Stat(name)
	if err != nil {
		return false
	}
	return info.Mode().IsDir()
}

// PathExists simply checks if a path exists.
func PathExists(path string) (bool, error) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false, nil
	} else if err != nil {
		return false, err
	}

	return true, nil
}

// MakeTmpDir creates a temporary directory with provided mode
// in os.TempDir if basedir is "". This function assumes that
// basedir exists, so it's the caller's responsibility to create
// it before calling it.
func MakeTmpDir(basedir, pattern string, mode os.FileMode) (string, error) {
	name, err := os.MkdirTemp(basedir, pattern)
	if err != nil {
		return "", fmt.Errorf("failed to create temporary directory: %s", err)
	}
	if err := os.Chmod(name, mode); err != nil {
		return "", fmt.Errorf("failed to change permission of %s: %s", name, err)
	}
	return name, nil
}

// MakeTmpFile creates a temporary file with provided mode
// in os.TempDir if basedir is "". This function assumes that
// basedir exists, so it's the caller's responsibility to create
// it before calling it.
func MakeTmpFile(basedir, pattern string, mode os.FileMode) (*os.File, error) {
	f, err := os.CreateTemp(basedir, pattern)
	if err != nil {
		return nil, fmt.Errorf("failed to create temporary file: %s", err)
	}
	if err := f.Chmod(mode); err != nil {
		return nil, fmt.Errorf("failed to change permission of %s: %s", f.Name(), err)
	}
	return f, nil
}

// MkdirAll creates a directory and parents if it doesn't exist with
// mode after umask reset.
func MkdirAll(path string, mode os.FileMode) error {
	oldmask := syscall.Umask(0)
	defer syscall.Umask(oldmask)

	return os.MkdirAll(path, mode)
}
