# Build Stage
FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the application
# Note: Vite uses environment variables at build time. 
# If you have VITE_ specific variables, they should be available here.
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
