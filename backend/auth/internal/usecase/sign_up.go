package usecase

import (
	"context"
	"fmt"

	"nau/auth/internal/domain"
	"nau/auth/internal/dto"
)

func (u *UserService) SignUp(ctx context.Context, input dto.SignUpInput) (dto.SignUpOutput, error) {
	const op = "usecase.SignUp"

	var output dto.SignUpOutput

	passwordHash, err := HashPassword(input.Password)
	if err != nil {
		return output, fmt.Errorf("unable to sign up: %s: %w", op, err)
	}

	id, err := u.postgres.CreateUser(
		ctx,
		domain.Name(input.Name),
		input.Role,
		input.Team,
		passwordHash,
		domain.Email(input.Email),
	)
	if err != nil {
		return output, fmt.Errorf("unable to sign up: %s: %w", op, err)
	}

	return dto.SignUpOutput{ID: id}, nil
}
