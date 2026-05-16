package dto

import "github.com/google/uuid"

type SignUpInput struct {
	Name     string `json:"name"`
	Role     string `json:"role"`
	Team     string `json:"team"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type SignUpOutput struct {
	ID uuid.UUID `json:"id"`
}
