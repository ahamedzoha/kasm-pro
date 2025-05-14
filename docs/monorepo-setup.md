# KASM-Pro Monorepo Setup with NX

## Overview

This document outlines the structure and setup for the KASM-Pro platform as a monorepo using NX. The platform consists of:

- Next.js 15.3.2 frontend for marketing site
- Vite with React 19.1 for SPA application interface
- NestJS 10 backend services
- All deployed to a homelab Kubernetes cluster via GitHub Actions

## Repository Structure

```
kasm-pro/
├── .github/                    # GitHub Actions workflows
├── .vscode/                    # VS Code configuration
├── apps/                       # Application projects
│   ├── marketing/              # Next.js 15.3.2 marketing site
│   ├── app/                    # Vite React 19.1 SPA
│   ├── auth-service/           # NestJS 10 authentication service
│   ├── environment-service/    # NestJS 10 environment orchestration
│   ├── challenge-service/      # NestJS 10 challenge validation
│   ├── progress-service/       # NestJS 10 user progress tracking
│   └── terminal-service/       # NestJS 10 terminal WebSocket service
├── libs/                       # Shared libraries
│   ├── api-interfaces/         # Shared API interfaces
│   ├── ui/                     # Shared UI components
│   ├── terminal/               # Terminal component library
│   ├── validation/             # Challenge validation library
│   └── util/                   # Shared utilities
├── tools/                      # Build scripts and tooling
├── docker/                     # Docker-related configuration
│   ├── environments/           # Environment templates
│   └── development/            # Local development setup
├── docs/                       # Project documentation
├── nx.json                     # NX configuration
├── package.json                # Root package.json
└── tsconfig.base.json          # Base TypeScript configuration
```

## Tech Stack

- **Monorepo Management**: NX
- **Frontend**:
  - Marketing Site: Next.js 15.3.2 (SSR)
  - Application: Vite with React 19.1
  - State Management: Redux Toolkit
  - Styling: Tailwind CSS
  - Terminal: xterm.js
- **Backend**:
  - NestJS 10 (TypeScript)
  - PostgreSQL (User data)
  - MongoDB (Course content)
  - Redis (Session management)
- **Infrastructure**:
  - Docker for containerization
  - Kubernetes for orchestration
  - GitHub Actions for CI/CD

## Initial Setup Steps

### 1. Create NX Workspace

```bash
# Create a new NX workspace
npx create-nx-workspace@latest kasm-pro --preset=empty --nx-cloud=false

# Navigate to the workspace
cd kasm-pro

# Install necessary plugins
npm install -D @nx/next @nx/react @nx/vite @nx/nest @nx/node @nx/js
```

### 2. Generate Applications

```bash
# Marketing site (Next.js)
nx g @nx/next:application marketing --directory=apps/marketing

# Application (Vite React)
nx g @nx/react:application app --directory=apps/app --bundler=vite

# Backend services (NestJS)
nx g @nx/nest:application auth-service --directory=apps/auth-service
nx g @nx/nest:application environment-service --directory=apps/environment-service
nx g @nx/nest:application challenge-service --directory=apps/challenge-service
nx g @nx/nest:application progress-service --directory=apps/progress-service
nx g @nx/nest:application terminal-service --directory=apps/terminal-service
```

### 3. Generate Shared Libraries

```bash
# API interfaces
nx g @nx/js:library api-interfaces --directory=libs/api-interfaces --buildable

# UI components
nx g @nx/react:library ui --directory=libs/ui --buildable

# Terminal components
nx g @nx/react:library terminal --directory=libs/terminal --buildable

# Validation library
nx g @nx/js:library validation --directory=libs/validation --buildable

# Utilities
nx g @nx/js:library util --directory=libs/util --buildable
```

## Docker Setup

### Multi-Stage Dockerfiles

Create optimized multi-stage Dockerfiles for each application. Here's an example for a NestJS service:

```dockerfile
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
RUN npx nx build auth-service --prod

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/dist/apps/auth-service ./
COPY --from=builder /app/node_modules ./node_modules

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000
CMD ["node", "main.js"]
```

### Docker Compose for Local Development

Create a `docker-compose.yml` file for local development that includes all services and dependencies:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: kasm
      POSTGRES_PASSWORD: kasm
      POSTGRES_DB: kasm
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: kasm
      MONGO_INITDB_ROOT_PASSWORD: kasm
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  mongo-data:
  redis-data:
```

## CI/CD Pipeline with GitHub Actions

### Docker Image Build and Push Workflow

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          filter: tree:0

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Nx Affected
        id: nx-affected
        run: |
          npx nx affected:apps --plain > affected.txt
          echo "AFFECTED=$(cat affected.txt)" >> $GITHUB_OUTPUT

      - name: Login to GitHub Container Registry
        if: github.event_name == 'push'
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Docker Image (Auth Service)
        if: contains(steps.nx-affected.outputs.AFFECTED, 'auth-service')
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/auth-service/Dockerfile
          push: ${{ github.event_name == 'push' }}
          tags: ghcr.io/${{ github.repository }}/auth-service:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Kubernetes Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Kubernetes

on:
  workflow_run:
    workflows: ["Build and Push Docker Images"]
    branches: [main]
    types: [completed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - uses: actions/checkout@v4
        
      - name: Install kubectl
        uses: azure/setup-kubectl@v3
        
      - name: Set up kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG }}" > $HOME/.kube/config
          chmod 600 $HOME/.kube/config
          
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f kubernetes/
```

## Kubernetes Configuration

Create Kubernetes manifests for each service:

```yaml
# kubernetes/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: kasm-pro
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: ghcr.io/yourusername/kasm-pro/auth-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: postgres-url
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "0.1"
            memory: "256Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: kasm-pro
spec:
  selector:
    app: auth-service
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

## Local Development Experience

### NX Configuration for Optimal DX

Update `nx.json`:

```json
{
  "extends": "nx/presets/npm.json",
  "affected": {
    "defaultBase": "main"
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"]
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"]
    }
  },
  "generators": {
    "@nx/react": {
      "application": {
        "style": "css",
        "linter": "eslint",
        "babel": true
      },
      "component": {
        "style": "css"
      },
      "library": {
        "style": "css",
        "linter": "eslint"
      }
    }
  }
}
```

### Development Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "start:dev": "nx run-many --target=serve --all --parallel",
    "start:marketing": "nx serve marketing",
    "start:app": "nx serve app",
    "start:services": "nx run-many --target=serve --projects=auth-service,environment-service,challenge-service,progress-service,terminal-service --parallel",
    "start:deps": "docker-compose up",
    "build:all": "nx run-many --target=build --all",
    "test:all": "nx run-many --target=test --all",
    "lint:all": "nx run-many --target=lint --all",
    "affected:apps": "nx affected:apps",
    "affected:build": "nx affected:build",
    "affected:test": "nx affected:test",
    "graph": "nx graph"
  }
}
```

### VS Code Configuration

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "nrwl.angular-console",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-azuretools.vscode-docker",
    "mikestead.dotenv",
    "humao.rest-client"
  ]
}
```

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Dependency Management

For strict type safety across the monorepo:

1. Update `tsconfig.base.json`:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2020",
    "module": "esnext",
    "lib": ["es2020", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@kasm-pro/api-interfaces": ["libs/api-interfaces/src/index.ts"],
      "@kasm-pro/ui": ["libs/ui/src/index.ts"],
      "@kasm-pro/terminal": ["libs/terminal/src/index.ts"],
      "@kasm-pro/validation": ["libs/validation/src/index.ts"],
      "@kasm-pro/util": ["libs/util/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

2. Set up ESLint with TypeScript strict rules:

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

Create `.eslintrc.json` at the root:

```json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "plugins": ["@typescript-eslint"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.base.json"
  },
  "rules": {
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

## Project Dependency Graph

NX provides a visualization of project dependencies through the `nx graph` command. This helps understand the relationships between applications and libraries.

```bash
npx nx graph
```

## Next Steps

After initial setup:

1. Configure shared authentication between marketing site and application
2. Set up the terminal component with xterm.js
3. Implement environment orchestration with Kubernetes
4. Create challenge validation system
5. Implement database integration with TypeORM/Prisma 