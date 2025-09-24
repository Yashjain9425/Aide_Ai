# Multi-stage build for Vite React app

FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first for better caching
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build-time API base URL for axios
ARG VITE_BASE_URL=http://localhost:3000
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN npm run build

FROM nginx:alpine AS runtime

# Copy SPA-friendly nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


