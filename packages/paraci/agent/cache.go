package agent

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	Directory string               `yaml:"directory"`
	Images    map[ImageInfo]string `yaml:"images"`
}

func InitCache(dir string, rds *redis.Client) (*Cache, error) {
	// read image list from redis, ctx timeout is 5 seconds
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	// get image list from redis, if not exists, create a new one
	images, err := rds.HGetAll(ctx, "images").Result()
	if err != nil {
		return nil, err
	}
	if len(images) == 0 {
		images = map[string]string{}
	}
	// create cache
	cache := Cache{
		Directory: dir,
		Images:    map[ImageInfo]string{},
	}
	// iterate images
	for image, uuid := range images {
		cache.Images[ImageInfo{Name: image}] = uuid
	}
	return &cache, nil
}
