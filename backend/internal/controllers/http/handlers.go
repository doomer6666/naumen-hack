package http

import (
	"crypto/rsa"
	"nau/auth/internal/usecase"
)

type Handlers struct {
	userService *usecase.UserService
	privateKey  *rsa.PrivateKey
}

func NewHandlers(service *usecase.UserService, key *rsa.PrivateKey) *Handlers {
	return &Handlers{
		userService: service,
		privateKey:  key,
	}
}