package oci

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/containers/image/v5/copy"
	"github.com/containers/image/v5/signature"
	"github.com/containers/image/v5/transports/alltransports"
	"github.com/opencontainers/umoci"
	"github.com/opencontainers/umoci/oci/cas/dir"
	"github.com/opencontainers/umoci/oci/casext"
	"github.com/opencontainers/umoci/oci/layer"
)

type Puller struct {
	policyContext *signature.PolicyContext
	cacheDir      string
}

func NewPuller(cacheDir string, policyPath string) (*Puller, error) {
	var policy *signature.Policy // This could be cached across calls in opts.
	var err error
	if policyPath == "" {
		policy = &signature.Policy{Default: []signature.PolicyRequirement{signature.NewPRInsecureAcceptAnything()}}
	} else {
		policy, err = signature.NewPolicyFromFile(policyPath)
	}
	if err != nil {
		return nil, err
	}
	ctx, err := signature.NewPolicyContext(policy)
	if err != nil {
		return nil, err
	}
	return &Puller{
		cacheDir:      cacheDir,
		policyContext: ctx,
	}, nil
}

func (p *Puller) PullImage(ctx context.Context, src string, dest string, options *copy.Options) (
	manifestBytes []byte, err error,
) {
	// TODO: register RACK transport
	srcRef, err := alltransports.ParseImageName(src)
	if err != nil {
		return nil, fmt.Errorf("Invalid source name %s: %v", src, err)
	}
	destRef, err := alltransports.ParseImageName(fmt.Sprintf("dir:%s", dest))
	if err != nil {
		return nil, fmt.Errorf("Invalid destination path %s: %v", dest, err)
	}

	manifestBytes, err = copy.Image(ctx, p.policyContext, destRef, srcRef, options)
	if err != nil {
		return nil, err
	}
	return manifestBytes, err
}

func (p *Puller) Unpack(src string, tag string, dest string) error {
	engine, err := dir.Open(src)
	if err != nil {
		return err
	}
	return umoci.Unpack(casext.NewEngine(engine), tag, dest, layer.UnpackOptions{
		KeepDirlinks: true,
		// TODO: IDMap support
		// MapOptions: ,
	})
}

func (p *Puller) Tarball(dir string, compress bool, w io.Writer) error {
	w2 := w
	if compress {
		w2 = gzip.NewWriter(w)
	}
	tw := tar.NewWriter(w2)
	defer tw.Close()
	return filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		header, err := tar.FileInfoHeader(info, info.Name())
		if err != nil {
			return err
		}

		// Set the correct path for the file within the tarball
		header.Name = path[len(dir)+1:]

		if err := tw.WriteHeader(header); err != nil {
			return err
		}

		// If the current file is a directory, skip it
		if info.IsDir() {
			return nil
		}

		srcFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer srcFile.Close()

		if _, err := io.Copy(tw, srcFile); err != nil {
			return err
		}

		return nil
	})
}

func (p *Puller) TarballToFile(dir string, compress bool, path string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	return p.Tarball(dir, compress, f)
}

func (p *Puller) SourceToTarballCached(src string, dest string, compress bool, w io.Writer) error {
	// parse tag from src
	srcParts := strings.Split(src, ":")
	tag := "latest"
	if len(srcParts) > 2 {
		tag = srcParts[len(srcParts)-1]
	}
	cd := p.cacheDir
	dTarballs := filepath.Join(cd, "tarballs")
	if err := os.MkdirAll(dTarballs, 0755); err != nil {
		return err
	}
	ext := "tar"
	if compress {
		ext = "tar.gz"
	}
	tarballPath := filepath.Join(dTarballs, fmt.Sprintf("%s.%s", tag, ext))
	if _, err := os.Stat(tarballPath); err == nil {
		// tarball already exists
		f, err := os.Open(tarballPath)
		if err != nil {
			return err
		}
		defer f.Close()
		if _, err := io.Copy(w, f); err != nil {
			return err
		}
		return nil
	}
	// tarball does not exist, pull image and create tarball
	dTmp, err := os.MkdirTemp(filepath.Join(cd, "tmp"), "tmp")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dTmp)
	if _, err := p.PullImage(context.Background(), src, dTmp, nil); err != nil {
		return err
	}
	f, err := os.Create(tarballPath)
	if err != nil {
		return err
	}
	defer f.Close()
	buf := bytes.NewBuffer([]byte{})
	teeBuf := io.TeeReader(buf, f)
	if err := p.Tarball(dTmp, compress, buf); err != nil {
		return err
	}
	_, err = io.Copy(w, teeBuf)
	return err
}
