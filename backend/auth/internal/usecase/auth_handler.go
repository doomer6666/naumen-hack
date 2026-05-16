package usecase

import (
	"context"
)

func (u *UserService) JWKS(ctx context.Context) []byte {
	return u.jwtFactory.JwksBytes
}
