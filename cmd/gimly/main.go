package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/murat/gimly/internal/api"
	"github.com/murat/gimly/internal/db"

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

	logger := log.New(os.Stdout, "", log.LstdFlags)

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
	apiServer := api.New(db, r, logger)

	app := &App{
		DB:     db,
		Logger: logger,
		Server: &http.Server{
			Addr:    ":" + port,
			Handler: apiServer.Handler(),
		},
	}

	done := make(chan bool)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)

	go func() {
		<-quit
		log.Println("shutting down...")

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		app.Server.SetKeepAlivesEnabled(false)
		if err := app.Server.Shutdown(ctx); err != nil {
			log.Fatalf("could not gracefully shutdown, %v\n", err)
		}
		close(done)
	}()

	log.Printf("listening on :%s\n", port)
	err = app.Server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("could not start, %w", err)
	}

	<-done
	log.Println("stopped!")

	return nil
}
