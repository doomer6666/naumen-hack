package http

import (
	"nau/auth/internal/usecase"
)

type Handlers struct {
	userService *usecase.UserService
}

func NewHandlers(service *usecase.UserService) *Handlers {
	return &Handlers{
		userService: service,
	}
}

