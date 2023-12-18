package common

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

func init_env() {
	var envFiles = []string{
		".env",
		"/etc/paraci/.env",
		os.Getenv("HOME") + ".config/paraci/.env",
	}

	LoadExtraEnvs(envFiles...)
}

func LoadExtraEnvs(path ...string) error {
	return godotenv.Load(path...)
}

// ExportEnvs exports paraci envs to a string that can be
// written to a dotenv file, _PARACI_ prefixed envs are not
// exported as they are considered internal
func ExportEnvs() string {
	rslt := []string{}
	for _, v := range os.Environ() {
		if strings.HasPrefix(v, "PARACI_") { // No _PARACI_
			rslt = append(rslt, v)
		}
	}
	return strings.Join(rslt, "\n")
}
