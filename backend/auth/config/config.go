package config

import (
	"log"
	"os"

	jwtfactory "nau/auth/internal/adapter/JWTFactory"
	"nau/auth/internal/adapter/postgres"
	"nau/auth/pkg/httpserver"

	"github.com/kelseyhightower/envconfig"
)

// Конфиг приложения
type App struct {
	Name    string `envconfig:"APP_NAME"    required:"true"`
	Version string `envconfig:"APP_VERSION" required:"true"`
}

type Config struct {
	App        App
	HTTP       httpserver.Config
	JWTFactory jwtfactory.Config
	// Logger   logger.Config
	Postgres postgres.Config
}

func InitConfig() (Config, error) {
	var cfg Config

	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatalf("Unable to load config: %s", err)
		os.Exit(1)
	}

	return cfg, nil
}
