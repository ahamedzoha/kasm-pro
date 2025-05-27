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
COPY apps/challenge-service ./apps/challenge-service
COPY libs ./libs

# Build the application
RUN npx nx build challenge-service --prod

# Stage 2: Runtime stage
FROM node:20-alpine AS runtime

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application from builder stage (note: build output is in apps/challenge-service/dist/)
COPY --from=builder --chown=nestjs:nodejs /app/apps/challenge-service/dist ./
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Install only production dependencies in runtime stage
RUN npm ci --only=production

# Switch to non-root user
USER nestjs

# Expose the port
EXPOSE 3002

# Start the application
CMD ["node", "main.js"] 