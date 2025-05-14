# Base stage for dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build app --prod

# Runtime stage - using Nginx to serve static content
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy built assets from builder stage
COPY --from=builder /app/dist/apps/app ./
COPY apps/app/nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:80/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 