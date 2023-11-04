package agent

import (
	"context"
	"os"
	"time"

	"github.com/containers/image/v5/docker"
	"github.com/containers/image/v5/types"
	"github.com/google/uuid"
)

type ImageRegistry struct {
	Url  string                  `yaml:"url"`
	Auth *types.DockerAuthConfig `yaml:"auth"`
}

type ImageInfo struct {
	Name string `yaml:"name"`
	Tag  string `yaml:"tag"`
}

// fetch an OCI image from registry, flat it to a folder
func (agent *Agent) FetchImage(imageInfo ImageInfo) error {
	imageUuid := uuid.New().String()
	imageDir := agent.Cache.Directory + "/" + imageUuid
	// create image dir
	err := os.MkdirAll(imageDir, 0755)
	if err != nil {
		return err
	}
	// fetch image
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	// fetch image from registry
	systemCtx := &types.SystemContext{
		DockerAuthConfig: agent.ImageRegistry.Auth,
	}

	imageName := agent.ImageRegistry.Url + "/" + imageInfo.Name + ":" + imageInfo.Tag
	ref, err := docker.ParseReference(imageName)
	if err != nil {
		return err
	}
	// fetch image
	img, err := ref.NewImage(ctx, systemCtx)
	if err != nil {
		return err
	}
	defer img.Close()

	// get image config and layers, flat them to image dir
	_, _, err = img.Manifest(ctx)
	if err != nil {
		return err
	}
	return nil
}
