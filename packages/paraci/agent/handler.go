package agent

import (
	"encoding/json"
	"log"

	"github.com/emicklei/go-restful/v3"
	"github.com/google/uuid"
	"github.com/lcpu-club/paralab/packages/paraci/agent/runc"
	"github.com/lcpu-club/paralab/packages/paraci/models"
)

func (agent *Agent) SpawnContainerHandler(req *restful.Request, resp *restful.Response) {

	agentRequest := models.AgentRequest{}
	err := json.NewDecoder(req.Request.Body).Decode(&agentRequest)
	if err != nil {
		log.Println(err)
		return
	}
	containerUUID := uuid.New().String()
	runc.CreateContainer(&agent.agentRunc, &agentRequest.Container, containerUUID)
}

func (agent *Agent) KillContainerHandler(req *restful.Request, resp *restful.Response) {

}

func (agent *Agent) ListContainersHandler(req *restful.Request, resp *restful.Response) {

}

func (agent *Agent) IndexHandler(req *restful.Request, resp *restful.Response) {
	container := models.Container{
		Name:  "busybox",
		Image: "sunyh/busybox",
		Tag:   "latest",
		Env:   []string{"FOO=BAR"},
		Ports: map[int]int{8080: 8080},
		Volumes: map[string]string{
			"/tmp": "/tmp",
		},
		Network: "bridge",
		CPU:     "1",
		Memory:  "1G",
		Storage: "1G",
	}
	info := models.AgentRequest{
		Container: container,
		Signature: "test",
	}
	resp.WriteEntity(info)
}
