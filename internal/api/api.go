package api

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/murat/gimly/internal/db"
	"github.com/murat/gimly/internal/gimly"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/jaevor/go-nanoid"
	"gorm.io/gorm"
)

// Api interface
type Api interface {
	CreateHandler(w http.ResponseWriter, r *http.Request)
	GetHandler(w http.ResponseWriter, r *http.Request)
	Handler() *chi.Mux
}

type api struct {
	db     *gorm.DB
	router *chi.Mux
	logger *log.Logger
}

// New setups the API
func New(db *gorm.DB, router *chi.Mux, logger *log.Logger) Api {
	a := &api{db, router, logger}
	a.AddRoutes()

	return a
}

// Handler exports the router
func (a *api) Handler() *chi.Mux {
	return a.router
}

// AddRoutes ...
func (a *api) AddRoutes() {
	a.router.Post("/", a.CreateHandler)
	a.router.Get("/{id}", a.GetHandler)
}

// CreateHandler ...
func (a *api) CreateHandler(w http.ResponseWriter, r *http.Request) {
	req := &CreateRequest{}
	if err := render.Bind(r, req); err != nil {
		render.Render(w, r, ErrInvalidRequest(err))
	}

	shortID, err := nanoid.Standard(8)
	if err != nil {
		a.logger.Printf("generate short id failed, %v\n", err.Error())
		render.Render(w, r, ErrInternalServer(err))
	}

	url := &db.URL{
		ShortURL: gimly.ShortURL{
			Title: req.Data.Title,
			URL:   req.Data.URL,
		},
		ShortID: shortID(),
	}

	if err := a.db.Create(url).Error; err != nil {
		a.logger.Printf("create short link failed, %v\n", err.Error())
		render.Render(w, r, ErrInternalServer(err))

		return
	}

	_, _ = fmt.Fprintf(w, "%+v", url.ShortID)
}

// GetHandler ...
func (a *api) GetHandler(w http.ResponseWriter, r *http.Request) {
	url := db.URL{ShortID: chi.URLParam(r, "id")}
	if err := a.db.Where("short_id = ?", url.ShortID).First(&url).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			render.Render(w, r, ErrNotFound(err))

			return
		}

		a.logger.Printf("query failed, %v\n", err.Error())
		render.Render(w, r, ErrInternalServer(err))

		return
	}

	http.Redirect(w, r, url.ShortURL.URL, http.StatusPermanentRedirect)
}
