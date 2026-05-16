package ljwt

import (
	"crypto/rsa"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	jwt.RegisteredClaims
	Role string `json:"role"`
	Team string `json:"team"`
}

func GenerateAccessToken(userID, role, team string, privateKey *rsa.PrivateKey) (string, error) {
	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(35 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		Role: role,
		Team: team,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(privateKey)
}

func GenerateRefreshToken(userID string, privateKey *rsa.PrivateKey) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(privateKey)
}
