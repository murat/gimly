package main

import (
	"context"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"time"

	"github.com/murat/gimly/internal/api"
	"github.com/murat/gimly/internal/db"
	"github.com/murat/gimly/web"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"gorm.io/gorm"
)

// App holds the required things
type App struct {
	DB     *gorm.DB
	Logger *log.Logger
	Server *http.Server
}

var (
	port, dbPath string
	logger       *log.Logger
	webFS        fs.FS
)

func main() {
	if err := run(os.Args); err != nil {
		log.Printf("could not start app, %v", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	flags := flag.NewFlagSet(args[0], flag.ExitOnError)
	flags.StringVar(&port, "port", "8080", "-port 8080")
	flags.StringVar(&dbPath, "db", "sqlite.db", "-db sqlite.db")
	if err := flags.Parse(args[1:]); err != nil {
		return fmt.Errorf("could not parse flags, err: %w", err)
	}

	logger = log.New(os.Stdout, "", log.LstdFlags)

	db, err := db.New(dbPath)
	if err != nil {
		return fmt.Errorf("could not open db, err: %w", err)
	}

	r := chi.NewRouter()
	// Add default middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	webFS, _ = fs.Sub(web.FS, "build")
	r.HandleFunc("/", staticHandler)
	r.HandleFunc("/static*", staticHandler)
	r.HandleFunc("/{*.(json|ico|png|jpg|webm|txt)}", staticHandler)

	apiServer := api.New(db, logger)
	r.Route("/api", func(r chi.Router) {
		r.Post("/url", apiServer.CreateHandler)
		r.Get("/url/{id}", apiServer.GetHandler)
	})

	app := &App{
		DB:     db,
		Logger: logger,
		Server: &http.Server{
			Addr:    ":" + port,
			Handler: r,
		},
	}

	done := make(chan bool)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)

	go func() {
		<-quit
		logger.Println("shutting down...")

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		app.Server.SetKeepAlivesEnabled(false)
		if err := app.Server.Shutdown(ctx); err != nil {
			logger.Fatalf("could not gracefully shutdown, %v\n", err)
		}
		close(done)
	}()

	logger.Printf("listening on :%s\n", port)
	err = app.Server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("could not start, %w", err)
	}

	<-done
	logger.Println("stopped!")

	return nil
}

func staticHandler(w http.ResponseWriter, r *http.Request) {
	path := filepath.Clean(r.URL.Path)
	if path == "/" {
		path = "/index.html"
	}
	path = strings.TrimPrefix(path, "/")

	file, err := webFS.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			http.NotFound(w, r)
			return
		}
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	contentType := mime.TypeByExtension(filepath.Ext(path))
	w.Header().Set("Content-Type", contentType)
	if strings.HasPrefix(path, "static/") {
		w.Header().Set("Cache-Control", "public, max-age=31536000")
	}
	stat, err := file.Stat()
	if err == nil && stat.Size() > 0 {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", stat.Size()))
	}

	_, _ = io.Copy(w, file)
}
