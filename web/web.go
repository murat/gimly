package web

import "embed"

var (
	//nolint:typecheck
	//go:embed all:build
	FS embed.FS
)
