# KASM-Pro: Browser-Based Learning Platform

<p align="center">
  <img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="80" alt="Nx Logo" />
  <br />
  <strong>A browser-based learning platform for technical skills</strong>
</p>

<p align="center">
  <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/your-org/kasm-pro">
  <img alt="GitHub" src="https://img.shields.io/github/license/your-org/kasm-pro">
  <img alt="Nx" src="https://img.shields.io/badge/Nx-21.0.3-blue">
</p>

## 🎯 Overview

KASM-Pro is an interactive, browser-based learning platform that provides users with real, functioning virtual environments for practicing technical skills like Kubernetes, Docker, and cloud infrastructure. The platform features guided challenges, automated validation, and an intuitive interface that simulates real-world technical scenarios.

### Key Features

- 🖥️ **Browser-based terminal environments** - Full terminal emulation with xterm.js
- 🎯 **Guided challenges** - Step-by-step labs with automated validation
- 🔄 **Real-time feedback** - Instant validation and progress tracking
- 🛠️ **Multiple environment types** - Docker containers, Kubernetes clusters
- 👥 **User management** - Authentication, roles, and progress tracking
- 📊 **Analytics** - Learning progress and performance metrics

## 🏗️ Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        M[Marketing Site<br/>Next.js 15.3.2]
        A[Application<br/>Vite React 19.1]
    end

    subgraph "API Layer"
        G[API Gateway<br/>NestJS + Redis]
    end

    subgraph "Microservices"
        AS[Auth Service<br/>NestJS]
        ES[Environment Service<br/>NestJS]
        CS[Challenge Service<br/>NestJS]
        PS[Progress Service<br/>NestJS]
        TS[Terminal Service<br/>NestJS + Socket.IO]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>User Data)]
        MG[(MongoDB<br/>Course Content)]
        RD[(Redis<br/>Sessions & Cache)]
    end

    subgraph "Infrastructure"
        K8S[Kubernetes Cluster]
        REG[Container Registry]
        OBJ[Object Storage]
    end

    M --> G
    A --> G
    G --> AS
    G --> ES
    G --> CS
    G --> PS
    G --> TS

    AS --> PG
    PS --> PG
    CS --> MG
    G --> RD

    ES --> K8S
    K8S --> REG
    CS --> OBJ
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────┬───────────────────────────────────────┤
│  Marketing Site         │           Application                 │
│  (Next.js 15.3.2)      │        (Vite React 19.1)            │
│  - SEO optimized        │  - Terminal interface                │
│  - Public content       │  - Challenge UI                      │
│  - Auth status check    │  - Dashboard                         │
└─────────────────────────┴───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼───────────────────────────────┐
│                    API Gateway (Port 9600)                      │
│  - JWT Authentication            │  - Rate Limiting              │
│  - Request Routing               │  - Caching (Redis)            │
│  - WebSocket Proxy               │  - Circuit Breaker            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────┐         ┌──────────┐         ┌─────────────┐
│  Auth   │         │Challenge │         │Environment  │
│Service  │         │Service   │         │Service      │
│:3000    │         │:3002     │         │:3001        │
└─────────┘         └──────────┘         └─────────────┘
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────┐         ┌──────────┐         ┌─────────────┐
│Progress │         │Terminal  │         │Kubernetes   │
│Service  │         │Service   │         │Cluster      │
│:3003    │         │:3004     │         │             │
└─────────┘         └──────────┘         └─────────────┘
```

### Technology Stack

| Layer              | Technology        | Purpose                 |
| ------------------ | ----------------- | ----------------------- |
| **Frontend**       | Next.js 15.3.2    | Marketing site with SSR |
|                    | Vite + React 19.1 | Application interface   |
|                    | Redux Toolkit     | State management        |
|                    | Tailwind CSS      | Styling                 |
|                    | xterm.js          | Terminal emulation      |
| **Backend**        | NestJS 10         | Microservices framework |
|                    | TypeScript        | Type-safe development   |
|                    | Socket.IO         | Real-time communication |
| **Databases**      | PostgreSQL        | User data & progress    |
|                    | MongoDB           | Course content          |
|                    | Redis             | Sessions & caching      |
| **Infrastructure** | Kubernetes        | Container orchestration |
|                    | Docker            | Containerization        |
|                    | Nginx             | Load balancing          |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **Git**
- **PostgreSQL** 16+ (for local development)
- **MongoDB** 7.0+ (for local development)
- **Redis** 7.0+ (for local development)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/kasm-pro.git
   cd kasm-pro
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy environment templates
   cp .env.example .env.local

   # Set up service-specific environments
   cp apps/auth-service/.env.example apps/auth-service/.env.local
   cp apps/environment-service/.env.example apps/environment-service/.env.local
   cp apps/challenge-service/.env.example apps/challenge-service/.env.local
   cp apps/progress-service/.env.example apps/progress-service/.env.local
   cp apps/terminal-service/.env.example apps/terminal-service/.env.local
   ```

4. **Start development databases**

   ```bash
   docker-compose -f docker/development/docker-compose.yml up -d
   ```

5. **Start all services in development mode**

   ```bash
   npm run start:dev
   ```

   This will start:

   - Marketing site: http://localhost:4202
   - Application: http://localhost:4200
   - API Gateway: http://localhost:9600
   - All backend services on their respective ports

### Alternative: Docker Development

For a complete containerized development environment:

```bash
# Build and start all services
docker-compose up --build

# Or start in detached mode
docker-compose up -d --build
```

## 📁 Project Structure

```
kasm-pro/
├── apps/                           # Applications
│   ├── marketing/                  # Next.js marketing site
│   ├── app/                        # React application
│   ├── api-gateway/                # API Gateway service
│   ├── auth-service/               # Authentication service
│   ├── environment-service/        # Environment orchestration
│   ├── challenge-service/          # Challenge management
│   ├── progress-service/           # Progress tracking
│   ├── terminal-service/           # Terminal WebSocket service
│   └── *-e2e/                     # End-to-end tests
├── libs/                           # Shared libraries
│   ├── api-interfaces/             # Shared API interfaces
│   ├── ui/                         # UI component library
│   ├── terminal/                   # Terminal components
│   ├── validation/                 # Validation utilities
│   └── util/                       # Shared utilities
├── docs/                           # Documentation
├── docker/                         # Docker configurations
├── .github/                        # CI/CD workflows
└── tools/                          # Build tools
```

## 🔧 Development

### Running Individual Services

```bash
# Frontend applications
nx serve marketing          # Marketing site
nx serve app               # Main application

# Backend services
nx serve api-gateway       # API Gateway
nx serve auth-service      # Authentication
nx serve environment-service # Environment management
nx serve challenge-service # Challenge system
nx serve progress-service  # Progress tracking
nx serve terminal-service  # Terminal service
```

### Building Applications

```bash
# Build all applications
nx run-many -t build

# Build specific application
nx build app
nx build auth-service
```

### Testing

```bash
# Run all tests
nx run-many -t test

# Run specific tests
nx test auth-service
nx e2e auth-service-e2e
```

### Database Management

```bash
# Start development databases
docker-compose -f docker/development/docker-compose.yml up -d postgres mongodb redis

# Connect to databases
docker exec -it kasm-postgres psql -U kasm -d kasm
docker exec -it kasm-mongodb mongosh -u kasm -p kasm
docker exec -it kasm-redis redis-cli
```

## 🌐 Environment Configuration

### Development (.env.local)

```bash
# Database URLs
DATABASE_URL="postgresql://kasm:kasm@localhost:5432/kasm"
MONGODB_URL="mongodb://kasm:kasm@localhost:27017/kasm"
REDIS_URL="redis://localhost:6379"

# Service URLs (localhost for development)
AUTH_SERVICE_URL="http://localhost:3000"
ENVIRONMENT_SERVICE_URL="http://localhost:3001"
CHALLENGE_SERVICE_URL="http://localhost:3002"
PROGRESS_SERVICE_URL="http://localhost:3003"
TERMINAL_SERVICE_URL="http://localhost:3004"

# JWT Configuration
JWT_SECRET="your-development-secret"
JWT_EXPIRES_IN="1h"
```

### Production (Kubernetes)

Uses ConfigMaps and Secrets for environment configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kasm-config
data:
  AUTH_SERVICE_URL: "http://auth-service:3000"
  ENVIRONMENT_SERVICE_URL: "http://environment-service:3001"
  # ... other service URLs
```

## 🐳 Docker & Kubernetes

### Local Docker Development

```bash
# Build all services
docker-compose build

# Start complete stack
docker-compose up

# View logs
docker-compose logs -f api-gateway
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n kasm-pro

# View service logs
kubectl logs -f deployment/auth-service -n kasm-pro
```

## 📊 Monitoring & Health Checks

All services expose health check endpoints:

- **Health**: `/health` - Overall service health
- **Readiness**: `/health/ready` - Service ready to accept traffic
- **Liveness**: `/health/live` - Service is alive

### Service Status

```bash
# Check all service health
curl http://localhost:9600/health
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

## 🔒 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Marketing Site
    participant A as App
    participant G as API Gateway
    participant AS as Auth Service

    U->>M: Visit marketing site
    M->>G: Check /auth/status
    G->>AS: Validate JWT cookie
    AS->>G: Return auth status
    G->>M: { authenticated: true/false }

    alt User not authenticated
        U->>M: Click "Login"
        M->>A: Redirect to /login
        U->>A: Enter credentials
        A->>G: POST /auth/login
        G->>AS: Forward login request
        AS->>G: Return JWT
        G->>A: Set HTTP-only cookie
        A->>M: Redirect back
    else User authenticated
        M->>U: Show "Go to App" button
        U->>A: Access application
        A->>G: API requests with cookie
        G->>AS: Validate JWT
    end
```

## 🧪 Testing Strategy

### Unit Tests

```bash
nx test auth-service
nx test challenge-service
```

### Integration Tests

```bash
nx e2e auth-service-e2e
nx e2e environment-service-e2e
```

### End-to-End Tests

```bash
# Run all e2e tests
nx run-many -t e2e
```

## 📈 Performance Targets

| Metric                   | Target  | Current |
| ------------------------ | ------- | ------- |
| Terminal latency         | < 100ms | -       |
| API response time        | < 500ms | -       |
| Environment provisioning | < 30s   | -       |
| Concurrent users         | 500+    | -       |
| Service uptime           | 99.9%   | -       |

## 🚦 Development Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**

   ```bash
   nx test affected
   nx build affected
   ```

3. **Run linting**

   ```bash
   nx lint affected
   ```

4. **Create pull request**
   - Ensure all tests pass
   - Include proper documentation
   - Follow commit message conventions

## 📚 Documentation

- [Technical Specifications](docs/tecnical-specifications.md)
- [MVP Roadmap](docs/mvp-roadmap.md)
- [Monorepo Setup](docs/monorepo-setup.md)
- [Docker Usage](docs/docker-usage.md)
- [Implementation Checklist](docs/implementation-checklist.md)
- [Routing Management](docs/routing-management.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Nx Documentation](https://nx.dev)
- [NestJS Documentation](https://nestjs.com)
- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)

---

<p align="center">
  Built with ❤️ using <a href="https://nx.dev">Nx</a>
</p>
