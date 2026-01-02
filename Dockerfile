# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install bun
RUN apk add --no-cache curl && \
    curl -fsSL https://bun.sh/install | bash

# Copy files
COPY package.json bun.lock ./

# Install dependencies
RUN /root/.bun/bin/bun install

# Build the application (static export to /out)
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN /root/.bun/bin/bun run build

# Production stage - serve static files
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy static export output
COPY --from=builder /app/out ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["serve", "-p", "3000", "-s", "."]
