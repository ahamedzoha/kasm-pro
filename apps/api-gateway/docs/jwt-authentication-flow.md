# JWT Authentication Flow in API Gateway

## Overview

The API Gateway uses a **DynamicAuthGuard** that intelligently determines whether routes require authentication based on configuration rather than manual decorators.

## Authentication Flow

```
1. Request arrives at API Gateway
   ↓
2. DynamicAuthGuard checks if route is marked @Public()
   ↓ (if not public)
3. DynamicAuthGuard checks RouteConfigService for requiresAuth
   ↓ (if requiresAuth: true)
4. JWT token validation
   ↓ (if valid)
5. Request forwarded to microservice
   ↓
6. Response returned to client
```

## Route Configuration Examples

### Public Routes (No Authentication Required)

```typescript
// In route-config.service.ts
{
  service: "auth",
  path: "/api/v1/user/login",
  methods: ["POST"],
  requiresAuth: false, // ← This makes it public
},
{
  service: "auth",
  path: "/api/v1/user/register",
  methods: ["POST"],
  requiresAuth: false, // ← This makes it public
}
```

### Protected Routes (Authentication Required)

```typescript
{
  service: "auth",
  path: "/api/v1/user",
  methods: ["GET", "PUT", "DELETE"],
  requiresAuth: true, // ← JWT token required
},
{
  service: "environment-service",
  path: "/api/v1/environment",
  methods: ["POST", "GET", "PUT", "DELETE"],
  requiresAuth: true, // ← JWT token required
}
```

## How Tokens Work

### 1. User Registration/Login

```http
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (from auth-service):

```json
{
  "user": {
    "id": "123",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Authenticated Requests

```http
GET /api/v1/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Flow**:

1. API Gateway receives request
2. DynamicAuthGuard extracts token from `Authorization` header
3. JWT Strategy validates token signature and expiration
4. If valid, user object is attached to request
5. Request forwarded to auth-service
6. Response returned

### 3. Public Route Access

```http
POST /api/v1/user/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "newpassword123"
}
```

**Flow**:

1. API Gateway receives request
2. DynamicAuthGuard checks route config: `requiresAuth: false`
3. Request immediately forwarded to auth-service (no JWT validation)
4. Response returned

## Guard Configuration

### Current Routes That Should Be Public:

- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/register` - User registration
- `GET /api/v1/auth/status` - Service health check
- `GET /health` - Gateway health check

### Current Routes That Require Authentication:

- `GET /api/v1/user` - Get current user profile
- `PUT /api/v1/user` - Update user profile
- `DELETE /api/v1/user` - Delete user account
- All environment service routes
- All challenge service routes
- All progress service routes

## Token Storage (Frontend)

The frontend should store the JWT token and include it in requests:

```typescript
// Store token after login
localStorage.setItem("auth_token", response.data.token);

// Include in API requests
const token = localStorage.getItem("auth_token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

## Error Handling

### 401 Unauthorized

- Invalid or expired token
- Missing token for protected route

### 403 Forbidden

- Valid token but insufficient permissions
- Route exists but user can't access it

### 404 Not Found

- Route not configured in RouteConfigService
- Service unavailable

## Security Best Practices

1. **Token Expiration**: Tokens expire after 1 hour by default
2. **Secure Headers**: Tokens sent via `Authorization` header, not query params
3. **HTTPS Only**: All authentication should use HTTPS in production
4. **Token Refresh**: Implement refresh token mechanism for better UX
5. **Rate Limiting**: Apply stricter limits to auth endpoints

## Benefits of This Approach

1. **Centralized Configuration**: All auth rules in one place
2. **No Decorator Pollution**: Controllers stay clean
3. **Easy to Modify**: Change auth requirements without code changes
4. **Automatic Protection**: New routes are protected by default
5. **Clear Separation**: Auth logic separate from business logic
