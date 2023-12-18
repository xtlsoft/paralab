package image

import (
	"context"
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"runtime"

	"github.com/containers/image/v5/copy"
	"github.com/containers/image/v5/oci/layout"
	"github.com/containers/image/v5/signature"
	"github.com/containers/image/v5/transports/alltransports"
	"github.com/containers/image/v5/types"
	"github.com/lcpu-club/paralab/packages/paraci/agent/cache"
)

type ImageReference struct {
	source types.ImageReference
	types.ImageReference
}

type GoArch struct {
	Arch string
}

// Only support amd64 and arm64
var ArchMap = map[string]GoArch{
	"amd64": {
		Arch: "amd64",
	},
	"arm64": {
		Arch: "arm64",
	},
}

func defaultSystemContext() (*types.SystemContext, error) {
	sysCtx := &types.SystemContext{
		OSChoice: "linux",
	}
	if runtime.GOARCH == "amd64" {
		sysCtx.ArchitectureChoice = "amd64"
	} else if runtime.GOARCH == "arm64" {
		sysCtx.ArchitectureChoice = "arm64"
	} else {
		return nil, fmt.Errorf("unsupported architecture: %s", runtime.GOARCH)
	}
	return sysCtx, nil
}

func getRefDigest(ctx context.Context, ref types.ImageReference, sys *types.SystemContext) (digest string, err error) {
	if sys.ArchitectureChoice == "" {
		defaultCtx, err := defaultSystemContext()
		if err != nil {
			return "", err
		}
		sys.ArchitectureChoice = defaultCtx.ArchitectureChoice
	}
	// Get the digest of the image
	source, err := ref.NewImageSource(ctx, sys)
	if err != nil {
		return "", err
	}
	defer func() {
		if closeErr := source.Close(); closeErr != nil {
			err = closeErr
		}
	}()

	manifest, _, err := source.GetManifest(ctx, nil)
	if err != nil {
		return "", err
	}

	digest = fmt.Sprintf("%x", sha256.Sum256(manifest))
	digest = fmt.Sprintf("%x", sha256.Sum256([]byte(digest+sys.ArchitectureChoice)))
	return digest, nil
}

// Convert a source reference into a ImageReference to cache blobs
func ConvertReference(ctx context.Context, imgCache *cache.Cache, src types.ImageReference, sys *types.SystemContext) (types.ImageReference, error) {
	if imgCache == nil {
		return nil, fmt.Errorf("cache is not initialized")
	}
	var err error
	if sys == nil {
		sys, err = defaultSystemContext()
		if err != nil {
			return nil, err
		}
	}
	cacheTag, err := getRefDigest(ctx, src, sys)
	if err != nil {
		return nil, err
	}

	cacheDir, err := imgCache.GetOciCacheDir(cache.OciBlobCacheType)
	if err != nil {
		return nil, err
	}
	c, err := layout.ParseReference(cacheDir + ":" + cacheTag)
	if err != nil {
		return nil, err
	}
	return &ImageReference{
		source:         src,
		ImageReference: c,
	}, nil
}

func (t *ImageReference) NewImageSource(ctx context.Context, sys *types.SystemContext) (types.ImageSource, error) {
	return t.newImageSource(ctx, sys, log.Writer())
}

func (t *ImageReference) newImageSource(ctx context.Context, sys *types.SystemContext, w io.Writer) (types.ImageSource, error) {
	policy := &signature.Policy{Default: []signature.PolicyRequirement{signature.NewPRInsecureAcceptAnything()}}
	policyCtx, err := signature.NewPolicyContext(policy)
	if err != nil {
		return nil, err
	}

	// First we are fetching into the cache
	_, err = copy.Image(ctx, policyCtx, t.ImageReference, t.source, &copy.Options{
		ReportWriter: w,
		SourceCtx:    sys,
	})
	if err != nil {
		return nil, err
	}
	return t.ImageReference.NewImageSource(ctx, sys)
}

func ParseImageName(ctx context.Context, imgCache *cache.Cache, uri string, sys *types.SystemContext) (types.ImageReference, error) {
	ref, err := parseURI(uri)
	if err != nil {
		return nil, fmt.Errorf("unable to parse uri %s: %s", uri, err)
	}
	return ConvertReference(ctx, imgCache, ref, sys)
}

// handle uri of
func parseURI(uri string) (types.ImageReference, error) {
	img, err := alltransports.ParseImageName(uri)
	if err != nil {
		return nil, err
	}
	return img, nil
}

func ImageDigest(ctx context.Context, uri string, sys *types.SystemContext) (digest string, err error) {
	if sys == nil {
		var err error
		sys, err = defaultSystemContext()
		if err != nil {
			return "", err
		}
	}
	ref, err := parseURI(uri)
	if err != nil {
		return "", fmt.Errorf("unable to parse uri %s: %s", uri, err)
	}
	return getRefDigest(ctx, ref, sys)
}
