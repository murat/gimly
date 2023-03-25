package web

import "embed"

var (
	//go:embed all:build
	FS embed.FS
)
