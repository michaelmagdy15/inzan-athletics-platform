# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Pass in environment variables explicitly to guarantee Vite captures them
ENV VITE_SUPABASE_URL="https://axjpzootzbocwdrsbgmp.supabase.co"
ENV VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4anB6b290emJvY3dkcnNiZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzcxNzIsImV4cCI6MjA4Nzk1MzE3Mn0.yBQSGUYYMUQ_K3GVkU7TI2hWNxRWgkKML6sdbkt5QzE"

# Build the Vite project for production
RUN npm run build

# Production server stage
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port required by Cloud Run
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
