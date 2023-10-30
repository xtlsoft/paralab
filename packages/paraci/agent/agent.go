package agent

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/dotenv-org/godotenvvault"
	"github.com/emicklei/go-restful/v3"
)

type Agent struct {
	Host          string
	Port          int
	ImageRegistry string
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

// Create agent, read config from dotenv file
func NewAgent() Agent {
	err := godotenvvault.Load()
	if err != nil {
		log.Println("No .env file found, using default values")
	}

	host := getenv("AGENT_HOST", "localhost")
	port, err := strconv.Atoi(getenv("AGENT_PORT", "50201"))
	if err != nil {
		log.Fatal("Port is not a number")
	}
	imageRegistry := getenv("AGENT_IMAGE_REGISTRY", "localhost:5000")

	agent := Agent{
		Host:          host,
		Port:          port,
		ImageRegistry: imageRegistry,
	}

	return agent
}

func (agent *Agent) SpawnContainer(req *restful.Request, resp *restful.Response) {

}

func (agent *Agent) KillContainer(req *restful.Request, resp *restful.Response) {

}

func (agent *Agent) ListContainers(req *restful.Request, resp *restful.Response) {

}

// let agent listen to port
func (agent *Agent) Listen() {
	log.Printf("Listening on %s:%d\n", agent.Host, agent.Port)
	ws := new(restful.WebService)
	ws.Path("/api/v1").Consumes(restful.MIME_JSON).Produces(restful.MIME_JSON)
	ws.Route(ws.POST("/spawn").To(agent.SpawnContainer))
	ws.Route(ws.POST("/kill").To(agent.KillContainer))
	ws.Route(ws.GET("/list").To(agent.ListContainers))
	restful.Add(ws)
	log.Fatal(http.ListenAndServe(agent.Host+":"+strconv.Itoa(agent.Port), nil))
}
