package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	"nau/auth/internal/dto"
	"nau/auth/pkg/render"
)

func (h *Handlers) SignUp(w http.ResponseWriter, r *http.Request) {
	var input dto.SignUpInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(
			w,
			fmt.Sprintf("invalid inputuest body: %s", err.Error()),
			http.StatusBadRequest)

		return
	}

	output, err := h.userService.SignUp(r.Context(), input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)

		return
	}

	render.JSON(w, output, http.StatusCreated)
}

