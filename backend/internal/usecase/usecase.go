package usecase

import (
	"context"

	"nau/auth/internal/adapter/postgres"
	"nau/auth/internal/domain"

	"github.com/google/uuid"
)

type Postgres interface {
	UpdateUser(ctx context.Context,
		id uuid.UUID,
		name domain.Name,
		role,
		team,
		passwordHash string,
		email domain.Email,
	) error

	CreateUser(
		ctx context.Context,
		name domain.Name,
		role,
		team,
		passwordHash string,
		email domain.Email,
	) (uuid.UUID, error)

	ReadUser(ctx context.Context, email domain.Email) (domain.User, error)
	ReadUserByID(ctx context.Context, id uuid.UUID) (domain.User, error) // <-- Добавлено

	DeleteUser(ctx context.Context, id uuid.UUID) error

	GetUserPassword(ctx context.Context, email domain.Email) (string, error)
}

type UserService struct {
	postgres Postgres
}

func NewUserService(postgres *postgres.Pool) (*UserService, error) {
	return &UserService{
		postgres: postgres,
	}, nil
}

// Добавляем метод-обертку для middleware
func (u *UserService) ReadUserByID(ctx context.Context, id uuid.UUID) (domain.User, error) {
	return u.postgres.ReadUserByID(ctx, id)
}