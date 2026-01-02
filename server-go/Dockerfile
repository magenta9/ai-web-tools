FROM golang:1.23-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -ldflags="-s -w" -o server cmd/server/main.go

FROM alpine:3.19
WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata wget
ENV TZ=Asia/Shanghai
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/config ./config

# 验证配置文件是否存在
RUN ls -la /app/config/ || echo "Config directory not found"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

EXPOSE 3001
CMD ["./server"]
