package agent

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/containerd/go-runc"
	"github.com/containers/image/v5/types"
	"github.com/dotenv-org/godotenvvault"
	"github.com/emicklei/go-restful/v3"
	"github.com/lcpu-club/paralab/packages/paraci/agent/cache"
	"github.com/lcpu-club/paralab/packages/paraci/agent/image"
	"github.com/redis/go-redis/v9"
)

type Agent struct {
	ID            string
	Host          string
	Port          int
	ImageRegistry *image.ImageRegistry
	agentRunc     *runc.Runc
	SecretKey     string
	ContainerDir  string
	BlobCache     *cache.Cache
	RedisDB       *redis.Client
}

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

// Create agent, read config from dotenv file
func NewAgent(ID string) Agent {
	err := godotenvvault.Load()
	if err != nil {
		log.Println("No .env file found, using default values")
	}

	if ID == "DETECTHOSTNAME" {
		ID, err = os.Hostname()
		if err != nil {
			log.Fatal(err)
		}
	}

	secretKey := os.Getenv("SECRET_KEY")
	if len(secretKey) == 0 {
		log.Fatal("SECRET_KEY is not set")
	}

	host := getenv("AGENT_HOST", "localhost")
	port, err := strconv.Atoi(getenv("AGENT_PORT", "50201"))
	if err != nil {
		log.Fatal("Port is not a number")
	}

	imageRegistryAddr := getenv("AGENT_IMAGE_REGISTRY", "localhost:5000")
	ImageRegistryUsername := getenv("AGENT_IMAGE_REGISTRY_USERNAME", "")
	ImageRegistryPassword := getenv("AGENT_IMAGE_REGISTRY_PASSWORD", "")
	imageRegistry := image.ImageRegistry{
		Url: imageRegistryAddr,
		Auth: &types.DockerAuthConfig{
			Username: ImageRegistryUsername,
			Password: ImageRegistryPassword,
		},
	}

	// init redis cache
	redis_host := getenv("REDIS_HOST", "localhost")
	redis_port, err := strconv.Atoi(getenv("REDIS_PORT", "6379"))
	if err != nil {
		log.Fatal("Redis port is not a number")
	}
	redis_password := getenv("REDIS_PASSWORD", "")
	redis_db, err := strconv.Atoi(getenv("AGENT_REDIS_DB", "0"))
	if err != nil {
		log.Fatal("Redis db is not a number")
	}
	if err != nil {
		log.Fatal("Redis cache is not a boolean")
	}

	ctx := context.Background()
	redis_client := redis.NewClient(&redis.Options{
		Addr:     redis_host + ":" + strconv.Itoa(redis_port),
		Password: redis_password,
		DB:       redis_db,
	})
	_, err = redis_client.Ping(ctx).Result()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Redis cache connected")
	// end init redis cache
	cacheDir := getenv("AGENT_CACHE_DIR", "/var/lib/paraci/cache")
	cacheEnable := getenv("AGENT_CACHE_ENABLE", "true")
	if _, err := os.Stat(cacheDir); os.IsNotExist(err) {
		log.Println("Cache directory does not exist, creating...")
		err := os.MkdirAll(cacheDir, 0700)
		if err != nil {
			log.Fatal(err)
		}
	}
	log.Printf("Cache directory: %s\n", cacheDir)
	blobCache := cache.Cache{
		Directory:   cacheDir,
		CacheEnable: func() bool { b, _ := strconv.ParseBool(cacheEnable); return b }(),
	}
	err = blobCache.InitCache()
	if err != nil {
		log.Fatal(err)
	}

	debug := getenv("AGENT_DEBUG", "false")
	if debug == "true" {
		log.Println("Debug mode enabled")
	}

	containerDir := getenv("AGENT_CONTAINER_DIR", "/var/lib/paraci/containers")
	if _, err := os.Stat(containerDir); os.IsNotExist(err) {
		log.Println("Container directory does not exist, creating...")
		err := os.MkdirAll(containerDir, 0700)
		if err != nil {
			log.Fatal(err)
		}
	}
	log.Printf("Container directory: %s\n", containerDir)

	runc_command := getenv("AGENT_RUNC_COMMAND", "runc")
	runc_root := getenv("AGENT_RUNC_ROOT", "/var/run/paraci/runc")
	runc_log := getenv("AGENT_RUNC_LOG", "/var/log/paraci/runc")
	runc_log_format := getenv("AGENT_RUNC_LOG_FORMAT", "text")

	agent_runc := runc.Runc{
		Command:   runc_command,
		Root:      runc_root,
		Log:       runc_log,
		LogFormat: runc.Format(runc_log_format),
		Rootless:  func() *bool { b := true; return &b }(), // hardcode to true
	}
	agent := Agent{
		ID:            ID,
		Host:          host,
		Port:          port,
		ImageRegistry: &imageRegistry,
		agentRunc:     &agent_runc,
		SecretKey:     secretKey,
		ContainerDir:  containerDir,
		BlobCache:     &blobCache,
	}

	return agent
}

// let agent listen to port
func (agent *Agent) Listen() {
	ws := new(restful.WebService)
	ws.Path("/api/v1").Consumes(restful.MIME_JSON, restful.MIME_XML).Produces(restful.MIME_JSON, restful.MIME_XML)
	ws.Route(ws.POST("/spawn").To(agent.SpawnContainerHandler))
	ws.Route(ws.POST("/kill").To(agent.KillContainerHandler))
	ws.Route(ws.GET("/list").To(agent.ListContainersHandler))
	ws.Route(ws.GET("/").To(agent.IndexHandler))
	restful.Add(ws)
	log.Printf("Listening on %s:%d\n", agent.Host, agent.Port)
	log.Fatal(http.ListenAndServe(agent.Host+":"+strconv.Itoa(agent.Port), nil))
}
