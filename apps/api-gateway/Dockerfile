# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nx.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and workspace files
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs

# Build the application
RUN npx nx build api-gateway --prod

# Stage 2: Runtime stage
FROM node:20-alpine AS runtime

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/api-gateway ./
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Install only production dependencies in runtime stage
RUN npm ci --only=production

# Switch to non-root user
USER nestjs

# Expose the port
EXPOSE 9600

# Health check - using the fast /api/health/ready endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const req = http.request({hostname: 'localhost', port: 9600, path: '/api/health/ready', timeout: 2000}, (res) => { \
      if (res.statusCode === 200) process.exit(0); else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start the application
CMD ["node", "main.js"] 