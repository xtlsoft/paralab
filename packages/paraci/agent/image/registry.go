package image

import "github.com/containers/image/v5/types"

type ImageRegistry struct {
	Url  string
	Auth *types.DockerAuthConfig
}
