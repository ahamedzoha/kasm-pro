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
RUN npx nx build marketing --prod

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/dist/apps/marketing/.next/standalone ./
COPY --from=builder /app/dist/apps/marketing/.next/static ./dist/apps/marketing/.next/static
COPY --from=builder /app/dist/apps/marketing/public ./dist/apps/marketing/public

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3005
ENV PORT 3005
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 