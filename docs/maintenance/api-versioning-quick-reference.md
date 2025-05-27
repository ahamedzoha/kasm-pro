# API Versioning Quick Reference

## 🚀 Current Status

- **Active Version**: v1
- **Supported Versions**: v1
- **Gateway Port**: 9600
- **Version Headers**: `X-API-Version`, `X-API-Supported-Versions`

## 🔧 Common Commands

### Check API Health

```bash
curl http://localhost:9600/health
```

### Test Version Headers

```bash
curl -I http://localhost:9600/api/v1/auth/status
```

### Gateway Route Testing

```bash
# Test auth service
curl http://localhost:9600/api/v1/auth/status

# Test user endpoints
curl -X POST http://localhost:9600/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 🔍 Troubleshooting

### 404 Route Not Found

1. Check if route exists in `route-config.service.ts`
2. Verify service controller has correct `@Controller` path
3. Ensure API Gateway is running without global prefix

### 401 Unauthorized

1. Check `requiresAuth` setting in route config
2. Verify JWT token in Authorization header
3. Test with public endpoints first (`/auth/status`)

### Version Headers Missing

1. Check `VersionUtil` import in proxy controller
2. Verify `getSupportedVersions()` method is public
3. Check for version extraction errors

## 📋 Adding New Version Checklist

### Gateway Changes

- [ ] Add new routes in `route-config.service.ts`
- [ ] Update version detection logic if needed
- [ ] Test route matching with new version

### Service Changes

- [ ] Create new versioned controller (e.g., `@Controller('api/v2/auth')`)
- [ ] Add controller to service module
- [ ] Implement new endpoints with enhanced features

### Testing

- [ ] Unit tests for new version endpoints
- [ ] Integration tests for version compatibility
- [ ] Manual testing of version headers

### Documentation

- [ ] Update API documentation
- [ ] Create migration guide
- [ ] Update this quick reference

## 🔄 Version Migration Process

### 1. Planning Phase

```
[ ] Identify breaking changes
[ ] Document new features
[ ] Plan client migration strategy
[ ] Set deprecation timeline
```

### 2. Implementation Phase

```
[ ] Implement gateway routes
[ ] Create service controllers
[ ] Add comprehensive tests
[ ] Update documentation
```

### 3. Release Phase

```
[ ] Deploy to staging
[ ] Test with sample clients
[ ] Deploy to production
[ ] Monitor adoption metrics
```

### 4. Deprecation Phase

```
[ ] Announce deprecation (6+ months)
[ ] Monitor usage metrics
[ ] Provide migration support
[ ] Remove old version
```

## 🚨 Emergency Procedures

### Disable Version Temporarily

```typescript
// In route-config.service.ts
const routeConfigs = routeConfigs.filter((r) => !r.path.includes("/v2/"));
```

### Rollback Service Version

```bash
# Kubernetes rollback
kubectl rollout undo deployment/auth-service

# Or specific revision
kubectl rollout undo deployment/auth-service --to-revision=2
```

### Check Service Status

```bash
# Check all services
kubectl get pods

# Check specific service
kubectl describe pod auth-service-xxx

# View logs
kubectl logs -f deployment/auth-service
```

## 📊 Monitoring Commands

### Version Usage

```bash
# Check version distribution in logs
kubectl logs deployment/api-gateway | grep "X-API-Version"

# Monitor response times by version
kubectl logs deployment/api-gateway | grep "X-Gateway-Response-Time"
```

### Error Rates

```bash
# Check error rates
kubectl logs deployment/api-gateway | grep "ERROR"

# Version-specific errors
kubectl logs deployment/api-gateway | grep "v1" | grep "ERROR"
```

## 🔗 Key Files

### Gateway

- `apps/api-gateway/src/app/proxy/route-config.service.ts` - Route definitions
- `apps/api-gateway/src/app/proxy/proxy.controller.ts` - Request handling
- `apps/api-gateway/src/app/common/utils/version.util.ts` - Version utilities

### Auth Service

- `apps/auth-service/src/app/auth/auth.controller.ts` - V1 auth endpoints
- `apps/auth-service/src/app/auth/auth.module.ts` - Module configuration

### Documentation

- `docs/maintenance/api-versioning-management.md` - Full versioning guide
- `docs/api/` - API documentation (version-specific)

## 📞 Contacts

### Emergency

- **Platform Team**: [Contact]
- **On-Call Engineer**: [Contact]

### Development

- **API Team Lead**: [Contact]
- **Gateway Team**: [Contact]
- **Service Teams**: [Contact]

---

**Last Updated**: [Date]  
**Version**: 1.0
