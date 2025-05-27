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
COPY apps/app ./apps/app
COPY libs ./libs

# Build the application
RUN npx nx build app --prod

# Stage 2: Runtime stage
FROM node:20-alpine AS runtime

# Create app directory
WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=4200
ENV HOST=0.0.0.0

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vite -u 1001

# Copy package.json and install only production dependencies + vite
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage (Vite builds to apps/app/dist)
COPY --from=builder --chown=vite:nodejs /app/apps/app/dist ./dist

# Switch to non-root user
USER vite

# Expose the port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the application using vite preview
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4200", "--outDir", "dist"] 