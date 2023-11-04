package models

type AgentRequest struct {
	Container Container `json:"container"`
	Signature string    `json:"signature"`
}

type AgentResponse struct {
	CreationSuccess bool   `json:"creation_success"`
	StartSuccess    bool   `json:"start_success"`
	ContainerUUID   string `json:"container_uuid"`
}
