# 05-api-contracts.md

# oidc-oauth-1o1 — API Contracts

---

# 1. Purpose

This document defines all public and internal API contracts exposed by the platform.

It acts as the source of truth for:

- Controllers
- DTOs
- Frontend integration
- SDK development
- OpenAPI generation
- Scalar documentation

Business behavior is defined in `04-business-rules.md`.

This document only defines API structure and contracts.

---

# 2. API Standards

## Base URL

Versioned Business APIs:

```http
/api/v1
```

Examples:

```http
/api/v1/identity/login
/api/v1/users/me
/api/v1/sessions
/api/v1/clients
/api/v1/admin/users
```

---

## OIDC Endpoints

OIDC endpoints remain unversioned.

```http
/oauth/authorize
/oauth/token
/oauth/userinfo

/.well-known/openid-configuration
/.well-known/jwks.json
```

This preserves compatibility with OAuth/OIDC clients.

---

## Content Type

Request:

```http
Content-Type: application/json
```

Response:

```http
Content-Type: application/json
```

---

## Authentication

Protected APIs require:

```http
Authorization: Bearer <access_token>
```

Refresh tokens are stored in:

```http
HttpOnly Secure Cookie
```

---

# 3. Standard Response Format

## Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

# 4. Common Resources

## User Resource

```json
{
  "id": "usr_xxx",
  "email": "john@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "role": "USER",
  "email_verified": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

## Session Resource

```json
{
  "id": "ses_xxx",
  "device_name": "Windows",
  "is_current": true,
  "last_active_at": "2026-01-01T00:00:00Z",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## Client Resource

```json
{
  "id": "cli_xxx",
  "name": "My App",
  "client_type": "CONFIDENTIAL",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

# 5. Identity APIs

## Register

### POST

```http
/api/v1/identity/register
```

### Request

```json
{
  "given_name": "John",
  "family_name": "Doe",
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

### Response

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {},
    "session": {},
    "access_token": "jwt"
  }
}
```

Refresh token is set as cookie.

---

## Login

### POST

```http
/api/v1/identity/login
```

### Request

```json
{
  "email": "john@example.com",
  "password": "password"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "session": {},
    "access_token": "jwt"
  }
}
```

---

## Verify Email

### GET

```http
/api/v1/identity/verify-email?token=xxx
```

### Response

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Resend Verification Email

### POST

```http
/api/v1/identity/resend-verification
```

### Request

```json
{
  "email": "john@example.com"
}
```

---

## Forgot Password

### POST

```http
/api/v1/identity/forgot-password
```

### Request

```json
{
  "email": "john@example.com"
}
```

---

## Reset Password

### POST

```http
/api/v1/identity/reset-password
```

### Request

```json
{
  "token": "reset_token",
  "password": "NewPassword123!"
}
```

---

## Google Login

### GET

```http
/api/v1/identity/google
```

---

## GitHub Login

### GET

```http
/api/v1/identity/github
```

---

# 6. Users APIs

## Current User

### GET

```http
/api/v1/users/me
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

---

## Update Profile

### PATCH

```http
/api/v1/users/me
```

### Request

```json
{
  "given_name": "John",
  "family_name": "Smith"
}
```

---

## Delete Account

### DELETE

```http
/api/v1/users/me
```

Soft delete.

---

## List Consents

### GET

```http
/api/v1/users/me/consents
```

---

## Revoke Consent

### DELETE

```http
/api/v1/users/me/consents/:consentId
```

---

# 7. Sessions APIs

## List Sessions

### GET

```http
/api/v1/sessions
```

---

## Logout Current Session

### POST

```http
/api/v1/sessions/logout
```

---

## Logout All Sessions

### POST

```http
/api/v1/sessions/logout-all
```

---

## Revoke Specific Session

### DELETE

```http
/api/v1/sessions/:sessionId
```

---

## Refresh Access Token

### POST

```http
/api/v1/sessions/refresh
```

Uses refresh cookie.

Returns:

```json
{
  "success": true,
  "data": {
    "access_token": "jwt"
  }
}
```

New refresh token cookie is issued.

---

# 8. Clients APIs

## List Clients

### GET

```http
/api/v1/clients
```

---

## Get Client

### GET

```http
/api/v1/clients/:clientId
```

---

## Create Client

### POST

```http
/api/v1/clients
```

### Request

```json
{
  "name": "My App",
  "client_type": "CONFIDENTIAL",
  "redirect_uris": ["http://localhost:3000/callback"]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "client": {},
    "client_secret": "shown_once"
  }
}
```

---

## Update Client

### PATCH

```http
/api/v1/clients/:clientId
```

---

## Rotate Client Secret

### POST

```http
/api/v1/clients/:clientId/rotate-secret
```

Returns new secret once.

---

## Delete Client

### DELETE

```http
/api/v1/clients/:clientId
```

Soft delete.

---

# 9. Admin APIs

All endpoints require:

```txt
Role = ADMIN
```

---

## List Users

### GET

```http
/api/v1/admin/users
```

Supports:

```http
?page=1&limit=20
```

---

## Get User

### GET

```http
/api/v1/admin/users/:userId
```

---

## Suspend User

### POST

```http
/api/v1/admin/users/:userId/suspend
```

---

## Unsuspend User

### POST

```http
/api/v1/admin/users/:userId/unsuspend
```

---

## Soft Delete User

### DELETE

```http
/api/v1/admin/users/:userId
```

---

## Verify User Email

### POST

```http
/api/v1/admin/users/:userId/verify-email
```

### Request

```json
{
  "reason": "Support verification completed"
}
```

---

## List Clients

### GET

```http
/api/v1/admin/clients
```

---

## Get Client

### GET

```http
/api/v1/admin/clients/:clientId
```

---

## Suspend Client

### POST

```http
/api/v1/admin/clients/:clientId/suspend
```

---

## Unsuspend Client

### POST

```http
/api/v1/admin/clients/:clientId/unsuspend
```

---

## Delete Client

### DELETE

```http
/api/v1/admin/clients/:clientId
```

---

## Audit Logs

### GET

```http
/api/v1/admin/audit
```

Supports:

```http
?page=1&limit=20
```

---

# 10. OAuth/OIDC Endpoints

## Authorization Endpoint

### GET

```http
/oauth/authorize
```

Supports:

```txt
response_type=code
client_id
redirect_uri
scope
state
code_challenge
code_challenge_method
```

---

## Token Endpoint

### POST

```http
/oauth/token
```

Supported grants:

```txt
authorization_code
refresh_token
client_credentials
```

---

## Token Response

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 900,
  "id_token": "...",
  "refresh_token": "..."
}
```

Refresh token returned only when:

```txt
offline_access
```

is granted.

---

## UserInfo Endpoint

### GET

```http
/oauth/userinfo
```

---

## JWKS Endpoint

### GET

```http
/.well-known/jwks.json
```

---

## Discovery Endpoint

### GET

```http
/.well-known/openid-configuration
```

---

# 11. Pagination Contract

Supported format:

```http
?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

# 12. Validation Strategy

Validation library:

```txt
Zod
```

Used for:

- Request validation
- Response typing
- OpenAPI generation

---

# 13. OpenAPI & Documentation

Source of truth:

```txt
Zod Schemas
        ↓
OpenAPI Spec
        ↓
Scalar UI
```

No manually maintained OpenAPI YAML files.

---

# 14. Versioning Strategy

Business APIs:

```txt
/api/v1/*
```

OIDC APIs:

```txt
/oauth/*
/.well-known/*
```

remain unversioned.

---

# Final Contract Definition

The platform exposes two API surfaces:

1. Versioned business APIs for platform management, authentication, users, sessions, clients, and administration.
2. Standards-compliant OAuth 2.0 / OpenID Connect endpoints for authorization, token issuance, discovery, user information, and key distribution.

All contracts follow standardized responses, centralized error handling, JWT bearer authentication, HttpOnly refresh token cookies, OpenAPI documentation, and Zod-driven validation.
