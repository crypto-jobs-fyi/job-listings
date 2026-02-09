# Security Setup Guide

## Critical Security Fixes Applied

This document describes the security improvements made to the Job Finder application and the required environment configuration.

### 1. CORS Restrictions ✅
**Status:** FIXED

**What was changed:**
- Removed `Access-Control-Allow-Origin: *` from all API endpoints
- Restricted CORS to only allowed origins:
  - `https://job-finder.org`
  - `https://www.job-finder.org`
  - `http://localhost:3000` (development only)

**Files updated:**
- `api/admin/redis-data.js`
- `api/auth/send-code.js`
- `api/auth/verify-code.js`

---

### 2. Admin Endpoint Authentication ✅
**Status:** FIXED

**What was changed:**
- Added Bearer token authentication to `/api/admin/redis-data`
- Blocks all requests without valid `ADMIN_AUTH_TOKEN`
- Returns 403 Unauthorized for invalid tokens

**Required Environment Variable:**
```bash
ADMIN_AUTH_TOKEN=your-secure-random-token-here
```

**How to generate a secure token:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Files updated:**
- `api/admin/redis-data.js`
- `src/pages/AdminPage.svelte`

---

### 3. Error Message Sanitization ✅
**Status:** FIXED

**What was changed:**
- Removed `error.message` from error responses (exposed implementation details)
- Returns generic "Internal server error" message to clients
- Full error details logged server-side only

**Files updated:**
- `api/admin/redis-data.js`

---

### 4. Debug Logging Protection ✅
**Status:** FIXED

**What was changed:**
- Removed logging of verification codes in debug output
- Kept only email address in development logs
- Prevents code exposure via log aggregation services

**Files updated:**
- `api/auth/verify-code.js`

---

## Environment Configuration

### Required for Production
```bash
# Upstash Redis (full access token)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=AayoZQ...

# Email service
RESEND_API_KEY=re_...

# Admin authentication
ADMIN_AUTH_TOKEN=<secure-random-token>

# Public admin token (optional, for development)
PUBLIC_ADMIN_TOKEN=<same-as-ADMIN_AUTH_TOKEN>
```

### Vercel Deployment
1. Set all environment variables in Vercel project settings
2. Ensure ALLOWED_ORIGINS includes your production domain
3. Test admin access: `curl -H "Authorization: Bearer $ADMIN_AUTH_TOKEN" https://your-domain.com/api/admin/redis-data`

---

## Testing Security

### 1. Test CORS Restriction
```bash
# This should fail (wrong origin)
curl -X GET http://evil.com/api/admin/redis-data \
  -H "Origin: http://evil.com"

# This should succeed (correct origin)
curl -X GET https://job-finder.org/api/admin/redis-data \
  -H "Origin: https://job-finder.org" \
  -H "Authorization: Bearer $ADMIN_AUTH_TOKEN"
```

### 2. Test Admin Authentication
```bash
# This should fail (no token)
curl -X GET https://job-finder.org/api/admin/redis-data

# This should fail (wrong token)
curl -X GET https://job-finder.org/api/admin/redis-data \
  -H "Authorization: Bearer wrong-token"

# This should succeed (correct token)
curl -X GET https://job-finder.org/api/admin/redis-data \
  -H "Authorization: Bearer $ADMIN_AUTH_TOKEN"
```

### 3. Test Error Messages
```bash
# Should return generic error only
curl -X GET https://job-finder.org/api/admin/redis-data \
  -H "Authorization: Bearer valid-but-broken-request" 2>&1 | grep -i message
# Should NOT expose implementation details
```

---

## Future Security Recommendations

### High Priority
- [ ] Rate limiting on auth endpoints (already exists for codes, add for verify)
- [ ] HTTPS enforcement (redirect HTTP to HTTPS)
- [ ] Implement user session tokens (move from localStorage to secure HTTP-only cookies)
- [ ] Add request signing (prevent request replay attacks)

### Medium Priority
- [ ] Implement WebAuthn/2FA for admin access
- [ ] Add audit logging for admin operations
- [ ] Implement IP whitelisting for admin endpoints
- [ ] Add request body size limits

### Low Priority
- [ ] Implement Content Security Policy (CSP) headers
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Implement subdomain isolation

---

## Security Checklist

- [x] CORS properly restricted
- [x] Admin endpoint authenticated
- [x] Error messages sanitized
- [x] Debug logging protected
- [ ] Email regex validation improved (planned)
- [ ] Session tokens moved to HTTP-only cookies (planned)
- [ ] Rate limiting on verify endpoint (planned)

---

## Support

For security concerns, contact: yury.dubinin@gmail.com
