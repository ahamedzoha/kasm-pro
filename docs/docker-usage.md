# Docker Setup for KASM-Pro

This document explains how to use Docker with the KASM-Pro platform.

## Overview

KASM-Pro uses Docker for:

1. Local development with dependencies (PostgreSQL, MongoDB, Redis)
2. Building and running containerized services
3. Deployment to Kubernetes

## Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.21.0+
- Node.js 20.x
- NPM 10.x

## Project Structure

- Each application has its own Dockerfile in its respective directory
- The main `docker-compose.yml` file orchestrates all services
- The `docker/gateway` directory contains API gateway configuration
- Docker-specific configuration is in `.dockerignore`

## Service Ports

| Service             | Development Port        | Docker Port | Description                      |
| ------------------- | ----------------------- | ----------- | -------------------------------- |
| Marketing Site      | 4202                    | 4202        | Next.js marketing website        |
| Application         | 4200 (dev), 80 (Docker) | 80          | React SPA application interface  |
| API Gateway         | N/A                     | 8080        | API gateway for backend services |
| Auth Service        | 3000                    | 3000        | Authentication service           |
| Environment Service | 3001                    | 3001        | Environment orchestration        |
| Challenge Service   | 3002                    | 3002        | Challenge validation             |
| Progress Service    | 3003                    | 3003        | User progress tracking           |
| Terminal Service    | 3004                    | 3004        | Terminal WebSocket service       |
| UI Library          | 5173/5174               | N/A         | Component library (dev only)     |
| Terminal Library    | 5173/5174               | N/A         | Terminal components (dev only)   |

## Development Workflow

### NX Development with Docker Dependencies

The recommended development workflow is to:

1. Start just the database dependencies:

```bash
npm run docker:deps
```

2. In another terminal, start your development services:

```bash
npm run start:dev
```

This approach gives you hot-reloading for all services while providing the database dependencies.

### Docker-Only Development

To use Docker for everything (slower, but matches production):

```bash
npm run docker:up
```

## Starting Docker Services

### Starting Individual Database Services

```bash
# Start just PostgreSQL
docker-compose up postgres

# Start just MongoDB
docker-compose up mongodb

# Start just Redis
docker-compose up redis
```

### Starting All Services

```bash
docker-compose up
```

### Rebuilding After Changes

```bash
docker-compose up --build
```

## Individual Services

Each service can be built and run individually:

```bash
# Build and run auth service
docker-compose up --build auth-service

# Build and run terminal service
docker-compose up --build terminal-service
```

## Accessing Services

Use the ports defined in the Service Ports table above to access each service.

### API Endpoints

| Service             | Docker URL                             | Description                |
| ------------------- | -------------------------------------- | -------------------------- |
| Auth Service        | http://localhost:3000/api/auth         | Authentication API         |
| Environment Service | http://localhost:3001/api/environments | Environment management API |
| Challenge Service   | http://localhost:3002/api/challenges   | Challenge validation API   |
| Progress Service    | http://localhost:3003/api/progress     | User progress API          |
| Terminal Service    | http://localhost:3004/api              | Terminal WebSocket API     |
| API Gateway         | http://localhost:8080/api              | Combined API gateway       |

## Database Access

| Database   | Connection String                | Default Credentials        |
| ---------- | -------------------------------- | -------------------------- |
| PostgreSQL | postgresql://localhost:5432/kasm | User: kasm, Password: kasm |
| MongoDB    | mongodb://localhost:27017/kasm   | User: kasm, Password: kasm |
| Redis      | redis://localhost:6379           | No authentication          |

## Building for Production

To build production-ready Docker images:

```bash
# Build all images
docker-compose build

# Build a specific service
docker-compose build auth-service
```

## Docker in CI/CD

GitHub Actions workflows automatically build Docker images on push to the main branch.
See `.github/workflows/docker-build.yml` for configuration details.

## Kubernetes Deployment

The Docker images built by this process are deployed to Kubernetes.
See the `kubernetes/` directory for Kubernetes manifests.

## Troubleshooting

### Common Issues

#### Port Conflicts

If you see `EADDRINUSE` errors, it means a port is already in use. Check if another service is using the same port or if a previous instance of the service is still running.

#### Database Connection Issues

If services can't connect to databases, make sure the database containers are running:

```bash
docker-compose ps
```

#### Hot Reloading Not Working

When using `npm run start:dev` with Docker dependencies, changes to files might not trigger hot reloading. Try restarting the affected service.

### Container Logs

```bash
# View logs for a specific service
docker-compose logs auth-service

# Follow logs
docker-compose logs -f auth-service
```

### Restarting Services

```bash
# Restart a specific service
docker-compose restart auth-service
```

### Cleaning Up

```bash
# Stop all containers
docker-compose down

# Remove volumes (will delete database data)
docker-compose down -v
```

## Docker Scripts

The following npm scripts are available for Docker operations:

```bash
# Build all Docker images
npm run docker:build

# Start all Docker services
npm run docker:up

# Stop all Docker services
npm run docker:down

# Start just the database dependencies
npm run docker:deps

# Reset database data
npm run docker:db:reset

# View Docker logs
npm run docker:logs
```
