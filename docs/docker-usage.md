# Docker Usage Guide

This guide provides comprehensive instructions for building, running, and managing the KASM-Pro application using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ RAM (recommended for full stack)
- 20GB+ disk space

## Architecture Overview

The application consists of several containerized services:

### Frontend Applications

- **App (React + Vite)**: Main learning platform UI on port 4200
- **Marketing (Next.js)**: Marketing site on port 4202

### Backend Services

- **API Gateway (NestJS)**: Centralized routing, auth, and security on port 9600
- **Auth Service**: User authentication and authorization
- **Environment Service**: Container environment management
- **Challenge Service**: Learning challenges and validation
- **Progress Service**: User progress tracking
- **Terminal Service**: WebSocket terminal connections

### Data Services

- **PostgreSQL**: Primary database on port 5432
- **MongoDB**: Course content and challenges on port 27017
- **Redis**: Caching and sessions on port 6379

## Quick Start

### 1. Build and Start All Services

```bash
# Build all services
docker compose build

# Start the entire stack
docker compose up -d

# Check service status
docker compose ps
```

### 2. Access Applications

- **Main App**: http://localhost:4200
- **Marketing Site**: http://localhost:4202
- **API Gateway**: http://localhost:9600
- **API Health Check**: http://localhost:9600/api/health

## Service Management

### Individual Service Commands

```bash
# Build specific service
docker compose build app
docker compose build marketing
docker compose build api-gateway

# Start specific service
docker compose up -d app

# Restart service
docker compose restart app

# View logs
docker compose logs app
docker compose logs -f marketing  # Follow logs
```

### Database Management

```bash
# Start only databases
docker compose up -d postgres mongodb redis

# Reset databases (WARNING: destroys all data)
docker compose down -v
docker compose up -d postgres mongodb redis

# Access database directly
docker exec -it kasm-pro-postgres-1 psql -U kasm -d kasm
docker exec -it kasm-pro-mongodb-1 mongosh mongodb://kasm:kasm@localhost:27017/kasm
docker exec -it kasm-pro-redis-1 redis-cli
```

## Frontend Applications

### React App (Vite Preview Server)

The main learning platform frontend now uses Vite's preview server instead of nginx:

- **Technology**: React 19 + Vite 6 + TailwindCSS
- **Port**: 4200
- **Build Output**: `apps/app/dist/`
- **Health Check**: Node.js HTTP request
- **Features**: Hot reload in development, optimized production builds

**Development**:

```bash
# Local development
npm run start:app

# Build for production
nx build app --prod

# Preview production build
cd apps/app && vite preview
```

### Marketing App (Next.js Standalone)

The marketing site uses Next.js standalone mode for optimal Docker deployment:

- **Technology**: Next.js 15 + TailwindCSS
- **Port**: 4202
- **Build Output**: Standalone server + static assets
- **Health Check**: Node.js HTTP request
- **Features**: SSR, static optimization, automatic code splitting

**Development**:

```bash
# Local development
npm run start:marketing

# Build for production
nx build marketing --prod
```

## Environment Variables

### Core Configuration

```bash
# API Gateway
API_GATEWAY_URL=http://api-gateway:9600
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# Database URLs
DATABASE_URL=postgresql://kasm:kasm@postgres:5432/kasm
MONGODB_URI=mongodb://kasm:kasm@mongodb:27017/kasm?authSource=admin
REDIS_URL=redis://redis:6379

# Service URLs (internal)
AUTH_SERVICE_URL=http://auth-service:3000
ENVIRONMENT_SERVICE_URL=http://environment-service:3001
CHALLENGE_SERVICE_URL=http://challenge-service:3002
PROGRESS_SERVICE_URL=http://progress-service:3003
TERMINAL_SERVICE_URL=http://terminal-service:3004
```

## Health Checks and Monitoring

### Service Health Endpoints

```bash
# API Gateway health
curl http://localhost:9600/api/health/ready
curl http://localhost:9600/api/health/live

# Frontend app health (automatic)
curl http://localhost:4200  # React app
curl http://localhost:4202  # Marketing site

# Database health
docker compose ps  # Shows health status
```

### Log Monitoring

```bash
# View all logs
docker compose logs

# Follow specific service logs
docker compose logs -f api-gateway
docker compose logs -f app

# Filter logs by time
docker compose logs --since 30m api-gateway
```

## Production Deployment

### Security Considerations

- All services run as non-root users
- JWT secrets must be changed for production
- Network isolation between services
- Health checks for high availability
- Proper volume persistence for data

### Performance Optimization

- Multi-stage Docker builds for smaller images
- Production-only dependencies in runtime
- Nginx caching headers for static assets
- Redis caching for API responses
- CDN integration for static assets

### Scaling

```bash
# Scale specific services
docker compose up -d --scale auth-service=3
docker compose up -d --scale api-gateway=2

# Use load balancer (nginx, HAProxy, etc.)
# Configure database read replicas
# Use Redis cluster for high availability
```

## Troubleshooting

### Common Issues

**Port Conflicts**:

```bash
# Check what's using ports
sudo lsof -i :4200
sudo lsof -i :9600

# Change ports in docker-compose.yml if needed
```

**Database Connection Issues**:

```bash
# Check database health
docker compose ps postgres mongodb redis

# Reset databases
docker compose down -v && docker compose up -d postgres mongodb redis
```

**Frontend Assets Not Loading**:

- For React app: Check vite preview server logs
- For Marketing: Verify Next.js static file serving
- Clear browser cache and Docker build cache

**Memory Issues**:

```bash
# Check resource usage
docker stats

# Clean up unused resources
docker system prune -a
docker volume prune
```

### Development Mode

```bash
# Run only databases for local development
docker compose up -d postgres mongodb redis

# Run frontend apps locally
npm run start:app     # React app on 4200
npm run start:marketing  # Marketing on 4202

# Run backend services in Docker
docker compose up -d auth-service environment-service challenge-service progress-service terminal-service api-gateway
```

## Backup and Recovery

### Database Backups

```bash
# PostgreSQL backup
docker exec kasm-pro-postgres-1 pg_dump -U kasm kasm > backup_$(date +%Y%m%d).sql

# MongoDB backup
docker exec kasm-pro-mongodb-1 mongodump --uri="mongodb://kasm:kasm@localhost:27017/kasm?authSource=admin" --out=/backup

# Redis backup (automatic RDB snapshots)
docker exec kasm-pro-redis-1 redis-cli BGSAVE
```

### Volume Management

```bash
# List volumes
docker volume ls

# Backup volumes
docker run --rm -v kasm-pro_postgres-data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data

# Restore volumes
docker run --rm -v kasm-pro_postgres-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres-backup.tar.gz -C /
```
