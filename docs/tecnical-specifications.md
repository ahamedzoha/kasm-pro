## 1. System Architecture

### 1.1 High-Level Architecture

The platform follows a microservices architecture with the following primary components:

- **Frontend Applications**:
  - **Marketing Site**: Next.js-based SSR application for SEO-optimized public content
  - **Application**: Vite React SPA with WebSocket connections for terminal functionality
- **API Gateway**: Entry point for all API requests, handling routing and basic authentication
- **Authentication Service**: Manages user authentication and authorization
- **Environment Manager**: Orchestrates the creation and management of virtual environments
- **Challenge Service**: Manages challenge content and validation logic
- **Progress Service**: Tracks and stores user progress
- **Terminal Service**: Handles terminal connections and session management

### 1.2 Infrastructure Components

- **Kubernetes Cluster**: Primary orchestration platform for all services
- **Container Registry**: Stores environment images and service containers
- **Object Storage**: Stores static assets, course content, and environment templates
- **Relational Database**: Stores user data, progress, and structured content
- **NoSQL Database**: Stores challenge content and flexible schema data
- **Redis Cluster**: Handles session management and caching
- **ELK Stack**: Provides logging, monitoring, and analytics

### 1.3 Deployment Topology

- **Multi-Region**: Deploy in at least two geographic regions for redundancy
- **High Availability**: All critical services deployed with multiple replicas
- **Auto-Scaling**: Services scale based on demand metrics
- **Blue-Green Deployment**: Enable zero-downtime deployments

## 2. Frontend Specifications

### 2.1 Technologies

- **Framework**: React 19.1 (Vite for app, Next.js 15.3.2 for marketing site with SSR/SEO)
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS with custom components
- **Terminal**: xterm.js 5.0+ with xterm-addon-fit
- **WebSocket**: Socket.IO client
- **Build Tools**: Vite
- **Testing**: Jest, React Testing Library

### 2.2 Key Components

- **Terminal Component**: Handles terminal rendering and interaction
- **Challenge Interface**: Split view with resizable panels
- **Code Editor**: Monaco editor for file editing
- **Course Navigation**: Hierarchical course structure browser
- **User Dashboard**: Progress overview and course access
- **Marketing Site (Next.js)**: Uses SSR for SEO, checks `/api/auth/status` on load to show "Go to App" if user is logged in (cookie-based SSO)
- **App (Vite React)**: Handles main application, uses cookie-based JWT for authentication

### 2.3 Performance Requirements

- **Initial Load**: < 2 seconds on broadband (Core Web Vitals compliant)
- **Time to Interactive**: < 3 seconds
- **Terminal Responsiveness**: < 100ms input latency
- **Memory Usage**: < 100MB in common browsers

## 3. Backend Services Specifications

### 3.1 API Gateway

- **Technology**: Kong API Gateway
- **Features**:
  - JWT validation
  - Rate limiting (100 req/min per user)
  - Request logging
  - Service discovery via Kubernetes
  - CORS handling

### 3.2 Authentication Service

- **Technology**: NestJS 10
- **Database**: PostgreSQL
- **Authentication Methods**:
  - Email/password (bcrypt hashing)
  - OAuth (Google, GitHub)
  - SSO via SAML 2.0
- **Session Management**: JWT with 1-hour expiry, refresh tokens
- **Cookie-Based Auth**: JWT is set in an HTTP-only, Secure cookie at the parent domain (e.g., `.abclearning.com`) to enable SSO between marketing (Next.js 15.3.2) and app (Vite React 19.1) subdomains. Cookies use `SameSite=Lax`, `Secure`, and `httpOnly` flags.
- **Auth Status Endpoint**: `/api/auth/status` endpoint returns `{ authenticated: true/false, username }` for lightweight auth checks from the marketing site. This endpoint reads the JWT from the cookie and validates it.
- **CORS**: API allows credentials and origins from both `abclearning.com` and `app.abclearning.com`.
- **Logout**: Properly clears the cookie across all subdomains.

### 3.3 Environment Manager

- **Technology**: NestJS 10
- **Features**:
  - Kubernetes custom controller
  - Resource quota enforcement
  - Environment templating
  - Session tracking
  - Cleanup automation

### 3.4 Challenge Service

- **Technology**: NestJS 10
- **Database**: MongoDB
- **Features**:
  - Content delivery
  - Validation script execution
  - Progress checkpointing
  - Hint generation

### 3.5 Terminal Service

- **Technology**: NestJS 10 with Socket.IO
- **Features**:
  - Terminal session management
  - Command logging (optional)
  - Shell access proxying
  - Multiple terminal support

### 3.6 Progress Service

- **Technology**: NestJS 10
- **Database**: PostgreSQL
- **Features**:
  - Progress tracking
  - Analytics data collection
  - Achievement management
  - Learning path tracking

## 4. Database Schema

### 4.1 User Data (PostgreSQL)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  account_status VARCHAR(50) DEFAULT 'active',
  subscription_tier VARCHAR(50) DEFAULT 'free'
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  UNIQUE(user_id, role)
);

CREATE TABLE progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  challenge_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'not_started',
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  score FLOAT,
  time_spent INTEGER, -- in seconds
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  environment_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active'
);

```

### 4.2 Course Content (MongoDB)

```jsx
// Course Schema
{
  _id: ObjectId,
  title: String,
  description: String,
  image_url: String,
  difficulty: String, // beginner, intermediate, advanced
  tags: [String],
  modules: [
    {
      title: String,
      description: String,
      order: Number,
      challenges: [
        {
          _id: String,
          title: String,
          description: String,
          type: String, // guided, quiz, open, project
          estimated_time: Number, // in minutes
          points: Number,
          environment_template: String,
          instructions: String, // markdown
          validation_script: String, // script content
          hints: [String],
          order: Number
        }
      ]
    }
  ],
  created_at: Date,
  updated_at: Date,
  published: Boolean,
  author_id: String
}

```

## 5. Environment Specifications

### 5.1 Docker Environment

- **Base Images**: Ubuntu 22.04, Alpine Linux
- **Pre-installed Tools**: bash, curl, vim, git, nano
- **Resource Limits**:
  - CPU: 1 vCPU
  - Memory: 1GB
  - Storage: 5GB

### 5.2 Kubernetes Environment

- **Cluster Size**: 1 control plane + 2 worker nodes
- **Kubernetes Version**: Latest stable (minimum v1.26)
- **Network Plugin**: Calico
- **Pre-installed Tools**: kubectl, helm, kubectx
- **Resource Limits**:
  - Total CPU: 3 vCPU (1 per node)
  - Total Memory: 3GB (1GB per node)
  - Storage: 10GB

### 5.3 Cloud Provider Simulation

- **Supported Services**:
  - Object Storage (S3-compatible)
  - Virtual Machines
  - Load Balancers
  - Databases
- **Authentication**: Simulated IAM with limited permissions
- **Resource Limits**: Based on exercise requirements

## 6. Security Specifications

### 6.1 Authentication & Authorization

- **Password Requirements**: Minimum 10 characters, mixed case, numbers/symbols
- **Rate Limiting**: 5 failed login attempts before temporary lockout
- **Session Timeout**: 60 minutes of inactivity
- **RBAC Implementation**: Role-based access with least privilege principle
- **JWT in HTTP-only Cookies**: All authentication is managed via JWT tokens set in HTTP-only, Secure cookies at the parent domain for SSO across subdomains.
- **CSRF Protection**: Use SameSite=Lax and CSRF tokens for state-changing requests.

### 6.2 Environment Security

- **Network Isolation**: Each user environment in separate namespace/network
- **Container Security**:
  - Non-root user execution
  - Read-only file systems where possible
  - Limited capabilities
  - No privileged containers
- **Resource Quotas**: Strict limits to prevent resource exhaustion
- **Egress Control**: Limited outbound access (package repositories only)

### 6.3 Data Security

- **Data at Rest**: AES-256 encryption
- **Data in Transit**: TLS 1.3
- **PII Handling**: Minimization and isolation of personal data
- **Backups**: Encrypted, daily backups with 30-day retention

## 7. API Specifications

### 7.1 RESTful API Endpoints

### 7.1.1 Authentication API

```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login user (sets JWT cookie at .abclearning.com)
POST   /api/auth/refresh            - Refresh access token
POST   /api/auth/logout             - Logout user (clears cookie)
GET    /api/auth/me                 - Get current user info
GET    /api/auth/status             - Lightweight auth status check (reads JWT from cookie)
PUT    /api/auth/me                 - Update user info
POST   /api/auth/password/reset     - Request password reset
PUT    /api/auth/password           - Change password

```

### 7.1.2 Courses API

```
GET    /api/courses                 - List all courses
GET    /api/courses/{id}            - Get course details
GET    /api/courses/{id}/modules    - Get course modules
GET    /api/courses/{id}/challenges - Get course challenges
POST   /api/courses                 - Create course (admin)
PUT    /api/courses/{id}            - Update course (admin)
DELETE /api/courses/{id}            - Delete course (admin)

```

### 7.1.3 Challenges API

```
GET    /api/challenges/{id}         - Get challenge details
GET    /api/challenges/{id}/hints   - Get challenge hints
POST   /api/challenges/{id}/validate - Validate challenge progress
POST   /api/challenges/{id}/start   - Start challenge
POST   /api/challenges/{id}/submit  - Submit challenge solution

```

### 7.1.4 Environments API

```
GET    /api/environments            - List user environments
POST   /api/environments            - Create new environment
GET    /api/environments/{id}       - Get environment details
DELETE /api/environments/{id}       - Terminate environment
POST   /api/environments/{id}/extend - Extend environment time

```

### 7.1.5 Progress API

```
GET    /api/progress                - Get user progress summary
GET    /api/progress/courses/{id}   - Get progress for course
GET    /api/progress/challenges/{id} - Get progress for challenge

```

### 7.2 WebSocket API

### 7.2.1 Terminal WebSocket

```
CONNECT /ws/terminal/{session_id}   - Connect to terminal session
SEND    {type: "input", data: "..."}  - Send terminal input
RECEIVE {type: "output", data: "..."} - Receive terminal output

```

### 7.2.2 Validation WebSocket

```
CONNECT /ws/validation/{challenge_id} - Connect to validation stream
RECEIVE {type: "validation", task: "task1", status: "success"} - Validation updates
RECEIVE {type: "hint", message: "..."} - Hint messages

```

## 8. Monitoring & Observability

### 8.1 Logging

- **Log Format**: JSON structured logging
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Log Storage**: Elasticsearch (30-day retention)
- **Required Fields**:
  - timestamp
  - service
  - trace_id
  - user_id (when applicable)
  - request_id
  - severity
  - message

### 8.2 Metrics

- **Collection**: Prometheus
- **Visualization**: Grafana
- **Key Metrics**:
  - Request rate and latency (p50, p95, p99)
  - Error rate
  - Environment provisioning time
  - Terminal response time
  - Resource utilization
  - Active users and sessions

### 8.3 Tracing

- **System**: Jaeger
- **Sampling Rate**: 10% of requests
- **Traced Operations**:
  - API requests
  - Environment provisioning
  - Challenge validations
  - Database queries >100ms

### 8.4 Alerting

- **Alert Channels**: Email, Slack, PagerDuty
- **Critical Alerts**:
  - Service unavailability
  - Error rate >1%
  - API latency p95 >1s
  - Environment provision failure rate >5%
  - Database connection issues
  - Certificate expiration <14 days

## 9. Scalability & Performance

### 9.1 Horizontal Scaling

- **Frontend**: Scale based on request rate
- **API Services**: Scale based on CPU utilization (target 60%)
- **Environment Manager**: Scale based on environment creation queue length
- **Terminal Service**: Scale based on active WebSocket connections
- **Database**: Read replicas for high traffic periods

### 9.2 Resource Optimization

- **Environment Pooling**: Pre-provision common environment types
- **Content Caching**: CDN for static assets with 1-day TTL
- **API Caching**: Redis caching for frequently accessed data (5-minute TTL)
- **Database Query Optimization**:
  - Indexed fields for common queries
  - Query result caching
  - Connection pooling

### 9.3 Load Testing Requirements

- **Concurrent Users**: Support for 1,000 concurrent users per cluster
- **Environment Creation**: 100 simultaneous environment provisions
- **Terminal Sessions**: 2,000 active terminal sessions
- **API Load**: 500 requests per second with < 500ms response time

## 10. Deployment & DevOps

### 10.1 CI/CD Pipeline

- **Source Control**: Git with GitHub/GitLab
- **CI System**: GitHub Actions or GitLab CI
- **Build Process**:
  - Linting and static analysis
  - Unit tests
  - Integration tests
  - Container building and scanning
- **Deployment Process**:
  - Automated deployments to development environment
  - Manual approval for staging and production
  - Canary deployments for critical changes

### 10.2 Infrastructure as Code

- **Cloud Resources**: Terraform
- **Kubernetes Resources**: Helm charts
- **Configuration Management**: Kubernetes ConfigMaps and Secrets
- **Secret Management**: HashiCorp Vault or cloud provider solution

### 10.3 Backup & Recovery

- **Database Backups**: Daily full backups, hourly incremental
- **Configuration Backups**: Version controlled in Git
- **Recovery Objectives**:
  - RPO (Recovery Point Objective): 1 hour
  - RTO (Recovery Time Objective): 4 hours

## 11. Third-Party Integrations

### 11.1 Authentication Providers

- **OAuth Providers**: Google, GitHub, Microsoft
- **SAML Providers**: Okta, Auth0, Azure AD
- **MFA Support**: TOTP, SMS, email

### 11.2 Payment Processing

- **Payment Providers**: Stripe, PayPal
- **Subscription Management**: Stripe Billing
- **Invoice Generation**: PDF generation with customizable templates

### 11.3 Email Service

- **Provider**: SendGrid or AWS SES
- **Email Types**:
  - Registration confirmation
  - Password reset
  - Course notifications
  - Session expiration warnings
  - Marketing communications (opt-in)

## 12. Development Guidelines

### 12.1 Coding Standards

- **JavaScript/TypeScript**: AirBnB style guide
- **Python**: PEP 8
- **Go**: Go standard format
- **Java**: Google Java Style
- **Comments**: JSDoc for functions, inline for complex logic

### 12.2 Testing Requirements

- **Unit Test Coverage**: Minimum 80%
- **Integration Tests**: Cover all API endpoints
- **E2E Tests**: Critical user journeys
- **Performance Tests**: API response times and resource usage
- **Security Tests**: OWASP Top 10 vulnerability scanning

### 12.3 Documentation Requirements

- **API Documentation**: OpenAPI/Swagger
- **Code Documentation**: Inline documentation for public APIs
- **Architecture Documentation**: C4 model diagrams
- **Runbooks**: Environment setup and maintenance
- **User Documentation**: Help center content

## 13. Required Resources & Tech Stack

### 13.1 Development Team

- 1 Technical Project Manager
- 3 Frontend Developers (React)
- 2 Backend Developers (Node.js/Express)
- 2 Backend Developers (Go/Python)
- 1 DevOps Engineer
- 1 Database Specialist
- 1 UI/UX Designer
- 1 QA Engineer

### 13.2 Infrastructure Resources

- **Cloud Provider**: AWS, GCP, or Azure
- **Kubernetes Cluster**: EKS, GKE, or AKS
- **Storage**: S3 or equivalent (100GB initial)
- **Database**:
  - PostgreSQL: 100GB with read replicas
  - MongoDB: 50GB
  - Redis: 10GB
- **Compute**:
  - 32 vCPUs baseline for services
  - Autoscaling up to 128 vCPUs
  - 2-4 vCPUs per user environment

### 13.3 External Services

- Domain name and SSL certificates
- CDN provider
- Email delivery service
- Monitoring and alerting service
- Log analysis service
- Error tracking service
