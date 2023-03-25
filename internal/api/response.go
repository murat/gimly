package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/murat/gimly/internal/db"
)

// ErrResponse ...
type ErrResponse struct {
	Err        error  `json:"-"`
	StatusCode int    `json:"-"`
	StatusText string `json:"status"`
	ErrorText  string `json:"error,omitempty"`
}

// Render ...
func (e *ErrResponse) Render(w http.ResponseWriter, r *http.Request) error {
	render.Status(r, e.StatusCode)
	return nil
}

// ErrInvalidRequest ...
func ErrInvalidRequest(err error) render.Renderer {
	return &ErrResponse{
		Err:        err,
		StatusCode: http.StatusUnprocessableEntity,
		StatusText: http.StatusText(http.StatusUnprocessableEntity),
		ErrorText:  err.Error(),
	}
}

// ErrNotFound ...
func ErrNotFound(err error) render.Renderer {
	return &ErrResponse{
		Err:        err,
		StatusCode: http.StatusNotFound,
		StatusText: http.StatusText(http.StatusNotFound),
		ErrorText:  err.Error(),
	}
}

// ErrInternalServer ...
func ErrInternalServer(err error) render.Renderer {
	return &ErrResponse{
		Err:        err,
		StatusCode: http.StatusInternalServerError,
		StatusText: http.StatusText(http.StatusInternalServerError),
		ErrorText:  err.Error(),
	}
}

// Response ...
type Response struct {
	ID   int     `json:"-"`
	Data *db.URL `json:"data"`
}

// Render ...
func (e *Response) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}
