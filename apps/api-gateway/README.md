# KASM-Pro API Gateway

A comprehensive NestJS-based API Gateway that provides centralized routing, authentication, rate limiting, and monitoring for the KASM-Pro microservices architecture.

## 🚀 Features

### 🔐 Security

- **JWT Authentication**: Validates JWT tokens for protected routes
- **Rate Limiting**: Configurable rate limits per endpoint and user
- **CORS Protection**: Secure cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Request Sanitization**: Removes sensitive data from logs
- **Request Validation**: DTOs for type-safe request validation

### 🔄 Routing & Proxy

- **Dynamic Route Mapping**: Maps API paths to microservices
- **Circuit Breaker**: Prevents cascading failures
- **Request/Response Transformation**: Modifies headers and payloads
- **Health Checks**: Monitors downstream service health
- **WebSocket Proxying**: Real-time terminal connections via WebSocket

### 📊 Performance

- **Redis Caching**: Caches GET responses for improved performance
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Efficient HTTP client configuration
- **Request Timeout**: Configurable timeouts for downstream services

### 🔍 Monitoring & Error Handling

- **Comprehensive Logging**: Request/response logging with sanitization
- **Health Endpoints**: Kubernetes-ready health checks
- **Circuit Breaker Status**: Real-time service health monitoring
- **Performance Metrics**: Response time tracking
- **Global Exception Filter**: Consistent error responses
- **Response Transformation**: Standardized API response format

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │────│   API Gateway    │
│   (React)       │    │   (Port 9600)    │
└─────────────────┘    └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ Auth Service │ │ Environment │ │ Challenge  │
        │ (Port 3000)  │ │ Service     │ │ Service    │
        │              │ │ (Port 3001) │ │ (Port 3002)│
        └──────────────┘ └─────────────┘ └────────────┘
                                │
                        ┌───────▼───────┐
                        │ Terminal      │
                        │ Service       │
                        │ (WebSocket)   │
                        └───────────────┘
```

## 🛣️ Route Configuration

```typescript
// Auth Service Routes
POST /api/v1/user/login        -> auth-service:3000
POST /api/v1/user/register     -> auth-service:3000
GET  /api/v1/user              -> auth-service:3000
GET  /api/v1/auth/status       -> auth-service:3000

// Environment Service Routes
POST /api/v1/environment       -> environment-service:3001
GET  /api/v1/environments      -> environment-service:3001

// Challenge Service Routes
GET  /api/v1/challenges        -> challenge-service:3002
GET  /api/v1/challenge         -> challenge-service:3002

// Progress Service Routes
GET  /api/v1/progress          -> progress-service:3003
POST /api/v1/progress          -> progress-service:3003

// Terminal Service Routes
HTTP: ALL  /terminal/*         -> terminal-service:3004
WebSocket: /terminal/socket.io -> terminal-service:3004
```

## 🔌 WebSocket Terminal Integration

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:9600", {
  path: "/terminal/socket.io",
});

// Send terminal input
socket.emit("terminal:input", { data: "ls -la" });

// Listen for terminal output
socket.on("terminal:output", (data) => {
  console.log("Terminal output:", data);
});
```

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { "user": { "id": "123", "email": "user@example.com" } },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/user",
  "statusCode": 200
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/user/999"
  }
}
```

## ⚙️ Environment Configuration

```bash
# API Gateway Configuration
PORT=9600
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Service URLs
AUTH_SERVICE_URL=http://localhost:3000
ENVIRONMENT_SERVICE_URL=http://localhost:3001
CHALLENGE_SERVICE_URL=http://localhost:3002
PROGRESS_SERVICE_URL=http://localhost:3003
TERMINAL_SERVICE_URL=http://localhost:3004

# Frontend URLs for CORS
FRONTEND_URL=http://localhost:4200
MARKETING_URL=http://localhost:3001
```

## 🏃‍♂️ Running the Gateway

### Development

```bash
nx serve api-gateway
# HTTP: http://localhost:9600/api
# WebSocket: ws://localhost:9600/terminal/socket.io
```

### Production

```bash
nx build api-gateway
node dist/apps/api-gateway/main.js
```

## 🏥 Health Checks

- `GET /health` - Overall gateway health
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

## 🔒 Authentication

### Protected Routes

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     http://localhost:9600/api/v1/user
```

### Public Routes (use `@Public()` decorator)

- `POST /api/v1/user/login`
- `POST /api/v1/user/register`
- `GET /api/v1/auth/status`
- `GET /health`

## 🛡️ Security Features

- **Rate Limiting**: 3 tiers (short/medium/long)
- **Circuit Breaker**: 5 failure threshold, 60s reset
- **Request Validation**: Type-safe DTOs
- **Error Handling**: Consistent error codes
- **Logging**: Sanitized request/response logs

## 🔧 Development

### Adding New Routes

```typescript
// In RouteConfigService
{
  service: 'new-service',
  path: '/api/v1/new-feature',
  methods: ['GET', 'POST'],
  requiresAuth: true,
}
```

### Request Validation

```typescript
export class CreateUserDto {
  @IsString()
  email!: string;

  @IsString()
  password!: string;
}
```

## 📊 Key Components

- **ProxyModule**: HTTP routing and circuit breaker
- **AuthModule**: JWT authentication and guards
- **HealthModule**: Health checks and monitoring
- **WebSocketProxyGateway**: Terminal WebSocket proxying
- **LoggingInterceptor**: Request/response logging
- **HttpExceptionFilter**: Global error handling
- **ResponseTransformInterceptor**: Consistent API format

---

**🎯 Ready to replace nginx with intelligent, TypeScript-powered routing!**
