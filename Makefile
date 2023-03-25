build: clean
	GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o ./bin/gimly cmd/gimly/main.go

clean:
	go clean
	-rm ./bin/gimly

test:
	go test ./...

coverage:
	go test ./... -coverprofile=cover.out && go tool cover -html=cover.out -o cover.html

lint:
	-command -v golangci-lint >/dev/null 2>&1 || curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.52.1
	golangci-lint run ./... --fast