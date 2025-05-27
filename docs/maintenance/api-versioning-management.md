# API Versioning Management

## Overview

This document outlines the API versioning strategy, implementation guidelines, and maintenance procedures for the KASM-Pro platform. Our approach uses **Gateway-Level Versioning** to provide clean, consistent versioning across all microservices.

## Versioning Strategy

### Approach: Gateway-Level Versioning

**Why Gateway-Level?**

- ✅ **Clean Client Interface**: Clients use consistent `/api/v1/`, `/api/v2/` paths
- ✅ **Service Independence**: Services evolve without breaking client contracts
- ✅ **Centralized Management**: All version routing in API Gateway
- ✅ **Easy Migration**: Add new versions without touching existing ones
- ✅ **Backward Compatibility**: Multiple versions can coexist

### Version Format

- **Format**: `v{major}` (e.g., `v1`, `v2`, `v3`)
- **URL Structure**: `/api/v{version}/{service}/{endpoint}`
- **Examples**:
  - `/api/v1/auth/status`
  - `/api/v1/user/login`
  - `/api/v2/challenges/advanced`

## Current Implementation

### Gateway Configuration

The API Gateway (`apps/api-gateway`) handles all version routing:

```typescript
// Route configuration example
{
  service: "auth",
  path: "/api/v1/auth/status",
  methods: ["GET"],
  requiresAuth: false,
}
```

### Version Headers

All API responses include version information:

```http
X-API-Version: v1
X-API-Supported-Versions: v1, v2
X-API-Latest-Version: v2
X-Gateway-Version: 1.0.0
```

### Service Controllers

Services implement versioned controllers:

```typescript
@Controller('api/v1/auth')
export class AuthControllerV1 { ... }

@Controller('api/v2/auth')
export class AuthControllerV2 { ... }
```

## Version Management Procedures

### 1. Adding a New API Version

#### Step 1: Plan the Changes

- Document breaking changes from previous version
- Identify new features and endpoints
- Plan migration strategy for existing clients

#### Step 2: Update Gateway Routes

```typescript
// In apps/api-gateway/src/app/proxy/route-config.service.ts
const routeConfigs: RouteConfig[] = [
  // ... existing v1 routes

  // New v2 routes
  {
    service: "auth",
    path: "/api/v2/auth/login",
    methods: ["POST"],
    requiresAuth: false,
  },
  // ...
];
```

#### Step 3: Implement Service Controllers

```typescript
// In service (e.g., apps/auth-service/src/app/auth/)
@Controller("api/v2/auth")
export class AuthControllerV2 {
  // New v2 implementation
}
```

#### Step 4: Update Service Modules

```typescript
// Add new controller to module
@Module({
  controllers: [AuthControllerV1, AuthControllerV2],
  // ...
})
export class AuthModule {}
```

### 2. Version Lifecycle Management

#### Phase 1: Development

- Implement new version in parallel with existing
- Mark as beta/preview in documentation
- Limited client testing

#### Phase 2: Stable Release

- Full feature implementation
- Complete documentation
- Client migration guides

#### Phase 3: Maintenance

- Bug fixes for both old and new versions
- Performance improvements
- Security updates

#### Phase 4: Deprecation

- Announce deprecation timeline (minimum 6 months)
- Provide migration tools/guides
- Monitor usage metrics

#### Phase 5: Sunset

- Remove deprecated version
- Update documentation
- Archive old code

### 3. Breaking Changes Policy

#### What Constitutes a Breaking Change?

- Removing endpoints or fields
- Changing field types or formats
- Modifying authentication requirements
- Altering error response formats
- Changing rate limiting behavior

#### How to Handle Breaking Changes?

1. **New Major Version**: Create v2, v3, etc.
2. **Backward Compatibility**: Keep old version running
3. **Migration Period**: Minimum 6 months overlap
4. **Clear Communication**: Document all changes

### 4. Non-Breaking Changes

Can be implemented in current version:

- Adding new optional fields
- Adding new endpoints
- Improving performance
- Bug fixes
- Enhanced error messages (maintaining format)

## Implementation Examples

### Example 1: Auth Service Evolution

#### V1 - Current

```typescript
@Controller("api/v1/auth")
export class AuthControllerV1 {
  @Post("login")
  login(@Body() loginDto: LoginDtoV1) {
    // Basic login with username/password
    return { token: "jwt-token" };
  }
}
```

#### V2 - Enhanced

```typescript
@Controller("api/v2/auth")
export class AuthControllerV2 {
  @Post("login")
  login(@Body() loginDto: LoginDtoV2) {
    // Enhanced login with MFA support
    return {
      token: "jwt-token",
      refreshToken: "refresh-token",
      mfaRequired: false,
      expiresIn: 3600,
    };
  }

  @Post("mfa/verify")
  verifyMfa(@Body() mfaDto: MfaDto) {
    // New MFA endpoint
  }
}
```

### Example 2: Challenge Service Enhancement

#### V1 - Basic Challenges

```typescript
@Controller("api/v1/challenges")
export class ChallengeControllerV1 {
  @Get()
  getChallenges() {
    return challenges.map((c) => ({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
    }));
  }
}
```

#### V2 - Advanced Features

```typescript
@Controller("api/v2/challenges")
export class ChallengeControllerV2 {
  @Get()
  getChallenges(@Query() filters: ChallengeFiltersV2) {
    return challenges.map((c) => ({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      tags: c.tags,
      estimatedTime: c.estimatedTime,
      prerequisites: c.prerequisites,
      completionRate: c.completionRate,
    }));
  }

  @Get("advanced")
  getAdvancedChallenges() {
    // New endpoint for advanced challenges
  }
}
```

## Monitoring and Analytics

### Version Usage Tracking

Monitor API version usage:

```typescript
// Add to proxy controller
const currentVersion = VersionUtil.extractVersion(req.path) || "v1";
this.analyticsService.trackVersionUsage(currentVersion, req.path);
```

### Key Metrics to Track

- **Version Distribution**: Which versions are most used
- **Endpoint Popularity**: Most/least used endpoints per version
- **Error Rates**: Version-specific error patterns
- **Response Times**: Performance across versions
- **Client Migration**: Adoption rate of new versions

### Deprecation Monitoring

- Track usage of deprecated endpoints
- Alert when usage drops below threshold
- Monitor client migration progress

## Client Migration Guide

### For Frontend Applications

#### 1. Gradual Migration

```typescript
// API client configuration
const apiClient = new ApiClient({
  baseURL: "/api/v1", // Start with v1
  fallbackURL: "/api/v2", // Gradually migrate
});
```

#### 2. Feature Detection

```typescript
// Check API capabilities
const capabilities = await apiClient.get("/capabilities");
if (capabilities.mfaSupported) {
  // Use v2 MFA features
}
```

### For Mobile Applications

#### 1. Version Selection

```typescript
// App configuration
const API_VERSION = Platform.OS === "ios" ? "v2" : "v1";
```

#### 2. Backward Compatibility

```typescript
// Handle version differences
const loginResponse = await auth.login(credentials);
const token = loginResponse.token || loginResponse.accessToken;
```

## Testing Strategy

### Version Compatibility Testing

#### 1. Contract Testing

```typescript
// Ensure v1 contracts still work
describe("API v1 Compatibility", () => {
  it("should maintain login response format", () => {
    // Test existing contract
  });
});
```

#### 2. Cross-Version Testing

```typescript
// Test that both versions work
describe("Multi-Version Support", () => {
  it("should handle v1 and v2 requests", () => {
    // Test both versions
  });
});
```

### Automated Testing

```yaml
# GitHub Actions example
- name: Test API Versions
  run: |
    npm run test:api:v1
    npm run test:api:v2
    npm run test:compatibility
```

## Documentation Standards

### Version-Specific Documentation

#### Structure

```
docs/
├── api/
│   ├── v1/
│   │   ├── auth.md
│   │   ├── challenges.md
│   │   └── README.md
│   ├── v2/
│   │   ├── auth.md
│   │   ├── challenges.md
│   │   └── README.md
│   └── migration/
│       ├── v1-to-v2.md
│       └── breaking-changes.md
```

#### Content Requirements

- **API Reference**: Complete endpoint documentation
- **Examples**: Request/response samples
- **Migration Guides**: Step-by-step upgrade instructions
- **Breaking Changes**: Detailed change documentation
- **Deprecation Notices**: Timeline and alternatives

### OpenAPI Specification

Generate version-specific OpenAPI docs:

```typescript
// Swagger configuration
const configV1 = new DocumentBuilder()
  .setTitle("KASM-Pro API v1")
  .setVersion("1.0")
  .build();

const configV2 = new DocumentBuilder()
  .setTitle("KASM-Pro API v2")
  .setVersion("2.0")
  .build();
```

## Security Considerations

### Version-Specific Security

#### 1. Authentication Changes

- v1: JWT tokens only
- v2: JWT + refresh tokens + MFA

#### 2. Authorization Updates

- v1: Basic role-based access
- v2: Enhanced permissions with scopes

#### 3. Rate Limiting

```typescript
// Version-specific rate limits
const rateLimits = {
  v1: { limit: 100, window: "15m" },
  v2: { limit: 200, window: "15m" }, // Higher limit for v2
};
```

### Security Migration

- Audit version-specific vulnerabilities
- Ensure security patches apply to all supported versions
- Plan security-driven version upgrades

## Troubleshooting

### Common Issues

#### 1. Version Mismatch

**Problem**: Client expects v1 response, gets v2
**Solution**: Check version headers, update client configuration

#### 2. Missing Routes

**Problem**: New v2 route not working
**Solution**: Verify gateway route configuration and service controller

#### 3. Authentication Issues

**Problem**: v2 auth failing with v1 tokens
**Solution**: Implement token compatibility layer

### Debug Tools

#### Version Detection

```bash
curl -I http://localhost:9600/api/v1/auth/status
# Check X-API-Version header
```

#### Route Testing

```bash
curl -X GET http://localhost:9600/health
# Check supported versions in response
```

## Maintenance Schedule

### Monthly Tasks

- Review version usage metrics
- Update deprecation timelines
- Check client migration progress

### Quarterly Tasks

- Evaluate new version requirements
- Plan breaking changes
- Update documentation

### Yearly Tasks

- Major version planning
- Sunset old versions
- Architecture review

## Emergency Procedures

### Version Rollback

#### 1. Gateway Rollback

```typescript
// Temporarily disable v2 routes
const routeConfigs = routeConfigs.filter((r) => !r.path.includes("/v2/"));
```

#### 2. Service Rollback

```bash
# Deploy previous service version
kubectl rollout undo deployment/auth-service
```

### Hotfix Deployment

#### 1. Multi-Version Hotfix

- Apply fix to all supported versions
- Test compatibility
- Deploy in order: oldest to newest

#### 2. Critical Security Fix

- Prioritize latest version
- Backport to supported versions
- Coordinate with client teams

## Contact and Support

### API Team Contacts

- **API Lead**: [Contact Info]
- **Gateway Team**: [Contact Info]
- **Service Teams**: [Contact Info]

### Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **Platform Team**: [Contact Info]

---

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date + 3 months]
