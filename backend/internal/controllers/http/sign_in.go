package http

import (
	"encoding/json"
	"net/http"

	"nau/auth/internal/dto"
)

func (h *Handlers) SignIn(w http.ResponseWriter, r *http.Request) {
	var req dto.SignInInput
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	out, err := h.userService.SignIn(r.Context(), req, h.privateKey)
	if err != nil {
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}