package main

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"nau/auth/internal/adapter/postgres"
	httpCtrl "nau/auth/internal/controllers/http"
	"nau/auth/internal/usecase"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Загружаем .env файл
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ Файл .env не найден, используем переменные окружения системы")
	}

	// 2. Читаем конфиг из окружения
	dbCfg := postgres.Config{
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		DBName:   os.Getenv("DB_NAME"),
	}

	serverPort := os.Getenv("SERVER_PORT")
	if serverPort == "" {
		serverPort = "8080" // Фоллбэк на случай, если забыли указать в .env
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 3. Подключение к БД
	pool, err := postgres.New(ctx, dbCfg)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer pool.Close()

	// 4. Генерируем RSA ключи (для dev-режима)
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		log.Fatalf("Failed to generate RSA keys: %v", err)
	}
	publicKey := &privateKey.PublicKey

	// 5. Инициализация слоев
	userService, err := usecase.NewUserService(pool)
	if err != nil {
		log.Fatalf("Failed to create user service: %v", err)
	}

	handlers := httpCtrl.NewHandlers(userService, privateKey)
	router := httpCtrl.Router(userService, handlers, publicKey)

	// 6. Запуск сервера
	server := &http.Server{
		Addr:    ":" + serverPort,
		Handler: router,
	}

	go func() {
		fmt.Printf("🚀 Server starting on http://localhost:%s\n", serverPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// 7. Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("Shutting down server...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	fmt.Println("Server exited properly")
}