# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nx.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci --frozen-lockfile

# Copy source code and workspace files
COPY apps/marketing ./apps/marketing
COPY libs ./libs

# Build the application
RUN npx nx build marketing --prod

# Stage 2: Runtime stage
FROM node:20-alpine AS runtime

# Create app directory
WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=4202
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package.json and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# Copy built application from builder stage
# For Next.js Nx builds, the output is in apps/marketing/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/marketing/public ./public

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 4202

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4202', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "server.js"] 