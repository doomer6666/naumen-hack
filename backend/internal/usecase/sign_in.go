package usecase

import (
	"context"
	"crypto/rsa"
	"fmt"

	"nau/auth/internal/domain"
	"nau/auth/internal/dto"
	"nau/auth/internal/jwt"
)

// Подумать, как лучше передавать в ф-цию privateKey

func (u *UserService) SignIn(ctx context.Context, input dto.SignInInput, privateKey *rsa.PrivateKey) (dto.SignInOutput, error) {
	const op = "usecase.SignIn"

	var output dto.SignInOutput

	user, err := u.postgres.ReadUser(ctx, domain.Email(input.Email))
	if err != nil {
		return output, fmt.Errorf("unable to get password hash from db: %s: %w", op, err)
	}

	if !CheckPasswordHash(input.Password, user.PasswordHash) {
		return output, fmt.Errorf("wrong password: %s: %w", op, err)
	}

	accessToken, err := jwt.GenerateAccessToken(
		user.ID.String(),
		user.Role,
		user.Team,
		privateKey)
	if err != nil {
		return output, fmt.Errorf("unable to get access token: %s: %w", op, err)
	}

	refreshToken, err := jwt.GenerateRefreshToken(
		user.ID.String(),
		privateKey)
	if err != nil {
		return output, fmt.Errorf("unable to get refresh token: %s: %w", op, err)
	}

	return dto.SignInOutput{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}
