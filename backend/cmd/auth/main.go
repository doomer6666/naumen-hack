package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"nau/auth/config"
	jwtfactory "nau/auth/internal/adapter/JWTFactory"
	"nau/auth/internal/adapter/postgres"
	"nau/auth/internal/controllers/http"
	"nau/auth/internal/usecase"
	"nau/auth/pkg/httpserver"
)

func main() {
	// init config
	c, err := config.InitConfig()
	if err != nil {
		panic(err)
	}

	fmt.Println("config init successully")

	// run app
	err = AppRun(context.Background(), c)
	if err != nil {
		panic(err)
	}

	fmt.Println("app run successully")
}

func AppRun(ctx context.Context, c config.Config) error {
	// init postgres
	pgPool, err := postgres.New(ctx, c.Postgres)
	if err != nil {
		return fmt.Errorf("unable to init postgres: %w", err)
	}

	fmt.Println("postgres init successully")

	// init jwtfactory
	jwtFactory, err := jwtfactory.NewJWTFactory(ctx, c.JWTFactory)
	if err != nil {
		return fmt.Errorf("unable to init jwtfactory: %w", err)
	}

	// init usecase
	userService, err := usecase.NewUserService(pgPool, jwtFactory)
	if err != nil {
		return fmt.Errorf("unable to create usecase")
	}

	// init router
	router := http.Router(userService)
	httpServer := httpserver.New(&router, c.HTTP)

	if err := httpServer.Start(); err != nil {
		panic(err)
	}
	// Приложение запущено и готово к работе

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt, syscall.SIGTERM)

	<-sig // ждём здесь сигнала (Ctrl+C или SIGTERM)

	// Закрываем ресурсы
	pgPool.Close()

	return nil
}
