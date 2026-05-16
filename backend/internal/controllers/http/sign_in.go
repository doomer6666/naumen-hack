package http

import (
	"encoding/json"
	"net/http"

	"nau/auth/internal/dto"
	"nau/auth/pkg/render"
)

func (h *Handlers) SignIn(w http.ResponseWriter, r *http.Request) {
	var input dto.SignInInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)

		return
	}

	output, err := h.userService.SignIn(
		r.Context(),
		input)
	if err != nil {
		http.Error(w, "invalid email or password", http.StatusUnauthorized)

		return
	}

	render.JSON(w, output, http.StatusOK)
}

