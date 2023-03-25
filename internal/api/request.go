package api

import (
	"errors"
	"net/http"
	"net/url"

	"github.com/murat/gimly/internal/gimly"
)

// CreateRequest ...
// example: {"data": {"title": "duayen", "url": "https://murat.duayen.dev"}}
type CreateRequest struct {
	Data *gimly.ShortURL `json:"data"`
}

// Bind ...
func (req *CreateRequest) Bind(r *http.Request) error {
	if req.Data == nil {
		return errors.New("missing required fields")
	}

	if req.Data.URL == "" {
		return errors.New("url cannot be empty")
	}

	if _, err := url.ParseRequestURI(req.Data.URL); err != nil {
		return errors.New("url is not url")
	}

	return nil
}
