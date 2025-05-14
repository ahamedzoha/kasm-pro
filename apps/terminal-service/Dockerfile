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
RUN npx nx build terminal-service --prod

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/dist/apps/terminal-service ./
COPY --from=builder /app/node_modules ./node_modules

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

# Expose both HTTP and WebSocket ports
EXPOSE 3004
CMD ["node", "main.js"] 