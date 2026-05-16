package http

import (
	"context"
	"crypto/rsa"
	"net/http"
	"strings"

	"nau/auth/internal/domain"
	"nau/auth/internal/jwt"

	jwtv5 "github.com/golang-jwt/jwt/v5" // Алиас jwtv5, чтобы избежать конфликта
	"github.com/google/uuid"
)

type contextKey string

const userCtxKey contextKey = "user"

// CORS middleware
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Интерфейс для получения юзера
type UserServiceReader interface {
	ReadUserByID(ctx context.Context, id uuid.UUID) (domain.User, error)
}

// Auth middleware
func AuthMiddleware(publicKey *rsa.PublicKey, service UserServiceReader) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "missing auth header", http.StatusUnauthorized)
				return
			}

			tokenStr := strings.Split(authHeader, " ")
			if len(tokenStr) != 2 || tokenStr[0] != "Bearer" {
				http.Error(w, "invalid auth header format", http.StatusUnauthorized)
				return
			}

			// Используем алиас jwtv5
			token, err := jwtv5.ParseWithClaims(tokenStr[1], &jwt.Claims{}, func(t *jwtv5.Token) (interface{}, error) {
				return publicKey, nil
			})
			if err != nil || !token.Valid {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(*jwt.Claims)
			if !ok {
				http.Error(w, "invalid claims", http.StatusUnauthorized)
				return
			}

			userID, err := uuid.Parse(claims.Subject)
			if err != nil {
				http.Error(w, "invalid user id in token", http.StatusUnauthorized)
				return
			}

			user, err := service.ReadUserByID(r.Context(), userID)
			if err != nil {
				http.Error(w, "user not found", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), userCtxKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}