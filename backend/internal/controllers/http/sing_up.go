package http

import (
	"encoding/json"
	"net/http"

	"nau/auth/internal/dto"
)

func (h *Handlers) SignUp(w http.ResponseWriter, r *http.Request) {
	var req dto.SignUpInput
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	out, err := h.userService.SignUp(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(out)
}