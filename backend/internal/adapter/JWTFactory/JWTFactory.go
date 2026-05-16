package jwtfactory

import (
	"context"
	"crypto/rsa"
	"fmt"
	"os"

	"nau/auth/internal/ljwt"

	"github.com/golang-jwt/jwt/v5"
)

type Config struct {
	pemFile string `envconfig:"PEM_FILE"`
}

type JWTFactory struct {
	PrivateKey *rsa.PrivateKey
	PublicKey  *rsa.PublicKey
	JwksBytes  []byte
}

func NewJWTFactory(ctx context.Context, c Config) (*JWTFactory, error) {
	const op = "jwtfactory.NewJWTFactory"

	pemData, err := os.ReadFile(c.pemFile)
	if err != nil {
		return nil, fmt.Errorf("unable to read the pem data: %s: %w", op, err)
	}

	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(pemData)
	if err != nil {
		return nil, fmt.Errorf("unable to get private key from pem data: %s: %w", op, err)
	}

	publicKey := &privateKey.PublicKey

	jwksBytes, err := ljwt.PublicKeyToJWKS(publicKey)
	if err != nil {
		return nil, fmt.Errorf("unable to get jwksBytes: %s: %w", op, err)
	}

	return &JWTFactory{
		PrivateKey: privateKey,
		PublicKey:  publicKey,
		JwksBytes:  jwksBytes,
	}, nil
}
