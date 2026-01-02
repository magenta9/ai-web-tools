# Build stage
FROM oven/bun:alpine AS builder
WORKDIR /app

# Copy files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Build the application (static export to /out)
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN bun run build

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
CMD ["serve", "-p", "3000", "."]
