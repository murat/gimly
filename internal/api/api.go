package api

import (
	"errors"
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
	GetAllHandler(w http.ResponseWriter, r *http.Request)
}

type api struct {
	db     *gorm.DB
	logger *log.Logger
}

// New setups the API
func New(db *gorm.DB, logger *log.Logger) Api {
	a := &api{db, logger}

	return a
}

// CreateHandler ...
func (a *api) CreateHandler(w http.ResponseWriter, r *http.Request) {
	req := &CreateRequest{}
	if err := render.Bind(r, req); err != nil {
		_ = render.Render(w, r, ErrInvalidRequest(err))

		return
	}

	shortID, err := nanoid.Standard(8)
	if err != nil {
		a.logger.Printf("generate short id failed, %v\n", err.Error())
		_ = render.Render(w, r, ErrInternalServer(err))

		return
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
		_ = render.Render(w, r, ErrInternalServer(err))

		return
	}

	_ = render.Render(w, r, &Response{
		Data: url,
	})
}

// GetHandler ...
func (a *api) GetHandler(w http.ResponseWriter, r *http.Request) {
	url := db.URL{ShortID: chi.URLParam(r, "id")}
	if err := a.db.Where("short_id = ?", url.ShortID).First(&url).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			_ = render.Render(w, r, ErrNotFound(err))

			return
		}

		a.logger.Printf("query failed, %v\n", err.Error())
		_ = render.Render(w, r, ErrInternalServer(err))

		return
	}

	http.Redirect(w, r, url.ShortURL.URL, http.StatusPermanentRedirect)
}

// GetAllHandler ...
func (a *api) GetAllHandler(w http.ResponseWriter, r *http.Request) {
	var urls []db.URL

	if err := a.db.Find(&urls).Error; err != nil {
		a.logger.Printf("query failed, %v\n", err.Error())
		_ = render.Render(w, r, ErrInternalServer(err))

		return
	}

	_ = render.Render(w, r, &ListResponse{Data: urls})
}
