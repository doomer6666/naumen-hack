package http

import (
	"crypto/rsa"
	"net/http"

	"nau/auth/internal/usecase"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Роутинг (добавлен аргумент publicKey *rsa.PublicKey)
func Router(service *usecase.UserService, publicKey *rsa.PublicKey) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.URLFormat)
	r.Use(middleware.RequestID)
	// r.Use(CORS) // Подключаем CORS

	r.Get("/live", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	r.Get("/ready", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })

	handlers := NewHandlers(service)
	r.Route("/api", func(r chi.Router) {
		r.Route("/v1", func(r chi.Router) {
			// Публичные роуты
			r.Post("/register", handlers.SignUp)
			r.Post("/login", handlers.SignIn)

			// Защищенные роуты (требуют JWT)
			// r.Group(func(r chi.Router) {
			// 	r.Use(AuthMiddleware(publicKey, service))
			// 	r.Get("/me", handlers.Me)
			// })
		})
	})

	return r
}

