package httpserver

import (
	"fmt"
	"net/http"
	"time"
)

type Config struct {
	Host string `default:"127.0.0.1" envconfig:"HTTP_HOST"`
	Port string `default:"8083" envconfig:"HTTP_PORT"`
}

type Server struct {
	server *http.Server
}

func New(handler *http.Handler, c Config) *Server {
	httpAddr := fmt.Sprintf("%s:%s", c.Host, c.Port)
	server := Server{
		server: &http.Server{
			Addr:         httpAddr,
			Handler:      *handler,
			ReadTimeout:  4 * time.Second,
			WriteTimeout: 4 * time.Second,
			IdleTimeout:  60 * time.Second,
		},
	}

	return &server
}

func (s *Server) Start() error {
	err := s.server.ListenAndServe()
	if err != nil {
		return fmt.Errorf("unable to start the server: %w", err)
	}

	return nil
}

func (s *Server) Close() {
	// Shutdown
}
