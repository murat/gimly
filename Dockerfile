FROM golang:1.18.1-alpine as builder

ENV GO111MODULE=on

RUN apk add --no-cache build-base

WORKDIR /app

COPY . .

RUN make build

FROM alpine

COPY --from=builder /app/bin/gimly /bin/gimly

ENTRYPOINT [ "/bin/gimly"]