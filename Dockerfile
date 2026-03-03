# Build Stage
FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the application
# Build the application
# Note: Vite uses environment variables at build time. We explicitly write them in so the Cloud Build environment doesn't miss them.
RUN echo "VITE_SUPABASE_URL=https://axjpzootzbocwdrsbgmp.supabase.co" > .env
RUN echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4anB6b290emJvY3dkcnNiZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzcxNzIsImV4cCI6MjA4Nzk1MzE3Mn0.yBQSGUYYMUQ_K3GVkU7TI2hWNxRWgkKML6sdbkt5QzE" >> .env
RUN npm run build

# Runtime Stage
FROM nginx:stable-alpine

# Copy custom nginx configuration if needed, or use a default one that supports client-side routing
# We'll use a simple inline configuration for Nginx to handle React routing
RUN echo 'server { \
    listen 8080; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Copy build artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
