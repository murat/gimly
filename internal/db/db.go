package db

import (
	"fmt"
	"log"
	"time"

	"github.com/murat/gimly/internal/gimly"

	"gorm.io/driver/sqlite" // Sqlite driver based on GGO
	"gorm.io/gorm"
)

// URL db entity
type URL struct {
	ID        uint           `json:"-" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"-"`
	UpdatedAt time.Time      `json:"-"`
	ShortURL  gimly.ShortURL `json:"url" gorm:"embedded"`
	ShortID   string         `json:"short_id" gorm:"index"`
}

// New database setup
func New(path string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("could not connect to database, %w", err)
	}

	if err := db.AutoMigrate(&URL{}); err != nil {
		log.Println("db migration failed")
	}

	return db, nil
}
