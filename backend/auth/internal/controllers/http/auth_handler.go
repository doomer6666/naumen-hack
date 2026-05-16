package http

import "net/http"

func (h *Handlers) JWKS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write(h.userService.JWKS(r.Context()))
}
