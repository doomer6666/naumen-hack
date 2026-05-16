package http

import (
	"encoding/json"
	"net/http"

	"nau/auth/internal/domain"
)

// Me возвращает данные текущего пользователя
func (h *Handlers) Me(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(userCtxKey).(domain.User)
	if !ok {
		http.Error(w, "user not found in context", http.StatusUnauthorized)
		return
	}

	response := struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Role  string `json:"role"`
		Team  string `json:"team"`
		Email string `json:"email"`
	}{
		ID:    user.ID.String(),
		Name:  string(user.Name),
		Role:  user.Role,
		Team:  user.Team,
		Email: string(user.Email),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}