## Sprint Board — `oidc-oauth-1o1`

Sprint 1: Foundation & Core Identity
Started: 2026-06-03

---

## Backlog (Not Started)

- [ ] **14. Clients module**
  - CRUD for OAuth clients
  - Client secret generation and rotation
  - Redirect URI validation
  - Soft delete

- [ ] **15. OAuth module**
  - /oauth/authorize (authorization code + PKCE)
  - /oauth/token (auth_code, refresh_token, client_credentials grants)
  - /oauth/userinfo
  - Consent flow with skip-if-previously-granted
  - /.well-known/openid-configuration
  - /.well-known/jwks.json

- [ ] **16. Admin module**
  - User management (list, get, suspend, unsuspend, soft delete, verify email)
  - Client management (list, get, suspend, unsuspend, delete)
  - Audit log viewing
  - Role-based access (ADMIN only)

- [ ] **17. Docker Compose setup**
  - PostgreSQL container
  - API app container
  - Environment configuration

- [ ] **18. auth-web frontend**
  - Login/register pages
  - Consent screens
  - Developer portal (client registration, docs)

- [ ] **19. admin-panel frontend**
  - User/client management views
  - Audit log viewer

---

## In Progress (Current Sprint)

- [ ] **13. Identity/Users module**
  - GET/PATCH/DELETE /api/v1/identity/users/me
  - Consent listing and revocation
  - Profile update (given_name, family_name)

---

## Done (Shipped / Merged)

- ✅ **11. Audit module**
  - Status: Complete
  - Notes: `AuditService` implemented, logging integrated, 30-day retention cleanup script added, admin log viewing endpoint created, centralized audit constants.

- ✅ **12. Notifications module**
  - Status: Complete
  - Notes: `EmailService` implemented with Resend and integrated into the identity flows.

- ✅ **Refactor: Identity Service & Auth Flow**
  - Status: Complete
  - Notes: Renamed methods and implemented the 'Login on Verification' flow.

- ✅ **01. Backend API app scaffolding**
  - Status: Complete
  - Created apps/api with Express, TypeScript, folder structure
  - Module structure: src/modules/, src/shared/, src/config/
  - app.ts and server.ts entry points
  - All dependencies installed and configured

- ✅ **02. packages/shared contracts**
  - Status: Complete
  - Cross-app TypeScript types created
  - API request/response contracts
  - JWT claim shapes, OAuth client definitions, scope definitions
  - Package builds successfully

- ✅ **03. Database setup & Drizzle configuration**
  - Status: Complete
  - PostgreSQL connection configured
  - Drizzle ORM setup and config
  - Migrations setup ready

- ✅ **04. Database schema (all 12 tables)**
  - Status: Complete
  - Identity: users, user_identities, auth_action_tokens, login_throttles
  - OAuth: oauth_clients, oauth_client_redirect_uris, oauth_authorization_codes, oauth_consents, oauth_signing_keys
  - Sessions: sessions, refresh_tokens
  - Audit: audit_logs
  - All indexes and constraints per database design doc

- ✅ **05. Shared utilities**
  - Status: Complete
  - ApiError utility (badRequest, unauthorized, forbidden, notFound, conflict, tooManyRequests)
  - ApiResponse utility (standardized success/error responses)
  - Logger utility (info, warn, error — no console.log)
  - Env/config loader (env.ts, database.ts, auth.ts)
  - Validation middleware
  - Error handler middleware
  - Authentication middleware

- ✅ **06. Security module**
  - Status: Complete
  - JWT signing with RS256 (asymmetric)
  - JWKS key management (generate, rotate, expose public keys)
  - Password hashing with Argon2id
  - Token generation and hashing utilities

- ✅ **07. Identity module — Registration & Login**
  - Status: Complete
  - POST /api/v1/identity/register
  - POST /api/v1/identity/login
  - DTOs with Zod validation
  - Login throttling (5 attempts, 15 min lockout)
  - Email normalization
  - Auto-session creation on register/login

- ✅ **10. Sessions module**
  - Status: Complete
  - GET /api/v1/sessions (list)
  - POST /api/v1/sessions/logout
  - POST /api/v1/sessions/logout-all
  - DELETE /api/v1/sessions/:sessionId (revoke)
  - POST /api/v1/sessions/refresh (rotate refresh token)
  - Refresh token rotation with reuse detection
  - HttpOnly cookie for refresh tokens

---

## Ready for Testing

- ✅ **TypeScript compilation**
  - Status: Passes with zero errors
  - All type safety checks pass
  - Ready for runtime testing with database

---

## Blocked

- ⚠️ **Social Login (09)** — depends on Security module (06) and Shared utilities (05)
- ⚠️ **Sessions module (10)** — depends on Security module (06) for JWT issuance
- ⚠️ **Identity Email Verification (08)** — depends on Notifications module (12) for email delivery (can stub initially)

---

## Ready for Testing

_(empty)_

---

## Done (Shipped / Merged)

- ✅ **Initial monorepo setup**
  - Merged to main: 2026-06-03
  - Verified: yes
  - Notes: pnpm dlx create-turbo@latest, workspace configured

- ✅ **Project documentation**
  - Merged to main: 2026-06-03
  - Verified: yes
  - Notes: Problem statement, constraints, architecture, database, business rules, API contracts, coding standards

---

## Dependency Order

```
01 (API scaffold)
  → 02 (shared contracts)
  → 03 (database setup)
    → 04 (database schema)
      → 05 (shared utilities)
        → 06 (security module)
          → 07 (identity: register/login)
            → 08 (identity: email verify/password reset)
            → 09 (identity: social login)
            → 10 (sessions module)
```

---

## Weekly Cadence

- Monday AM: Review and update board
- Friday PM: Move completed items to Done
- Update statuses whenever work changes
