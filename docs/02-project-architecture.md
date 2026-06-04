# ✅ `02-project-architecture.md` (Final Corrected Version)

---

## `oidc-oauth-1o1 — System Architecture`

---

## 1. High-Level System Overview

This system is a **single-tenant identity and authorization platform** implemented as a **modular monolith API with supporting frontend applications**, designed to function as a lightweight OIDC-style identity provider for internal ecosystem applications.

It centralizes authentication, authorization, session management, and client trust into a single controlled system boundary.

---

## 2. Repository-Level Architecture

```txt
identity-platform/
│
├── api/              → Core identity + OAuth/OIDC engine (modular monolith)
├── auth-web         → User auth + developer portal + consent UI
├── admin-panel      → Internal platform administration UI
│
├── packages/
│   └── shared       → Cross-app contracts (types only)
│
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

### Architectural Principle

> Frontends are thin presentation layers. Backend is system of truth.
> Packages/shared is contract truth.

---

## 3. Monorepo & Tooling Layer (PNPM Workspaces)

The repository is managed using **pnpm workspaces**.

### 3.1 Responsibilities

- Workspace-based dependency management
- Single lockfile (`pnpm-lock.yaml`)
- Isolation of applications (`api`, `auth-web`, `admin-panel`, `packages/*`)
- Efficient dependency resolution

---

### 3.2 Workspace Model

Each unit is:

- an independent Node.js package
- built and deployed independently (frontend apps)
- linked via workspace resolution
- versioned together in a single repo lifecycle

---

### 3.3 Design Principle

> This is a modular monorepo, not a distributed system.

---

Paste this directly under **Section 3 (Monorepo & Tooling Layer)** in your `02-project-architecture.md`.

---

## 3.4 Build System Orchestration (Turborepo)

The monorepo uses **Turborepo** as the build orchestration layer on top of pnpm workspaces.

### Responsibilities

- Task orchestration across apps (`api`, `auth-web`, `admin-panel`)
- Parallel execution of builds, linting, and development servers
- Incremental build caching for faster CI/CD cycles
- Dependency-aware task pipelines across the workspace

---

### Why Turborepo is used

pnpm handles dependency management and workspace linking, while Turborepo handles execution efficiency and build orchestration.

This separation ensures:

- pnpm → structure and dependencies
- Turborepo → task execution and performance optimization

---

### Example workflows

```bash
pnpm dev        → runs Turbo pipeline for all apps in parallel
pnpm build      → cached and incremental builds across workspace
pnpm lint       → parallel lint execution across packages
```

```bash
# Create a new Turbo monorepo
pnpm dlx create-turbo@latest oidc-oauth-1o1
```

---

### Design Principle

> pnpm defines the monorepo structure. Turborepo optimizes how the system executes tasks across that structure.

---

## 4. Backend Architecture (API Layer)

### 4.1 Architectural Style

- Modular Monolith
- Domain-driven modules
- Stateless HTTP API
- PostgreSQL as source of truth
- Drizzle ORM for data access

---

### 4.2 Internal Structure

```txt
api/src/
│
├── modules/
│   ├── identity/
│   ├── users/
│   ├── oauth/
│   ├── clients/
│   ├── sessions/
│   ├── notifications/
│   ├── audit/
│   ├── admin/
│   └── security/
│
├── shared/        → Backend runtime primitives
├── config/
├── app.ts
└── server.ts
```

---

## 5. Module Architecture

Each module is **domain-owned and isolated by responsibility**.

---

### 5.1 identity

Authentication lifecycle:

- registration
- login/logout
- email/password auth
- social login (Google, GitHub)
- password reset
- email verification

---

### 5.2 users

Identity data system-of-record:

- profile
- roles
- preferences
- metadata

---

### 5.3 oauth (Core Engine)

OAuth2 / OIDC implementation:

- `/authorize`
- `/token`
- `/consent`
- `/userinfo`
- `/jwks`
- PKCE support
- scope validation
- discovery endpoints

Defines trust between clients and system.

---

### 5.4 clients

Application registry:

- client creation
- redirect URI validation
- secrets management
- client types:
  - confidential
  - public
  - machine-to-machine

---

### 5.5 sessions

Runtime auth state:

- refresh tokens
- session lifecycle
- device sessions
- revoke/logout

---

### 5.6 notifications

- email delivery
- templated emails
- verification flows
- password reset

---

### 5.7 audit

Observability:

- login events
- token issuance
- admin actions
- security logs

---

### 5.8 admin

Control plane:

- user management
- client management
- audits
- system config

---

### 5.9 security

Cryptographic core:

- JWT signing (asymmetric)
- JWKS key management
- password hashing
- key rotation

---

## 6. Frontend Architecture

---

### 6.1 auth-web (Unified Surface)

Single UX surface:

- login/register
- consent screens
- developer portal
- client registration
- docs

---

### 6.2 admin-panel

Internal control system:

- system monitoring
- user/client inspection
- audit logs
- admin operations

---

## 7. Cross-App Contracts Layer (`packages/shared`)

This is the **contract layer between frontend and backend**.

```txt
packages/shared/
│
├── auth/
├── oauth/
├── identity/
└── api/
```

---

### 7.1 Responsibilities

- shared TypeScript types
- API request/response contracts
- JWT claim shapes
- OAuth client definitions
- scope definitions

---

### 7.2 Example Contracts

```ts
export type JwtClaims = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
  clientId: string;
};
```

```ts
export type ClientType = "confidential" | "public" | "machine";
```

---

### Design Rule

> packages/shared contains only contracts — never runtime logic.

---

## 8. Backend Shared Layer (`api/src/shared`)

Runtime primitives used inside backend only.

```txt
api/src/shared/
│
├── constants/
├── enums/
├── errors/
├── middleware/
├── utils/
├── validators/
├── types/
└── logger/
```

---

### Rule

> api/shared = execution layer
> packages/shared = contract layer

---

## 9. Config Layer

```txt
api/src/config/
│
├── env.ts
├── database.ts
├── auth.ts
└── index.ts
```

---

## 10. Request Flow Architecture

### 10.1 Authentication

```
User → auth-web → identity → session → JWT
```

---

### 10.2 OAuth Flow

```
Client → /authorize
      → consent (auth-web)
      → /token
      → JWT issued
```

---

### 10.3 API Request

```
Client → API
       → JWT verification (security)
       → authorization
```

---

### 10.4 JWKS Flow

```
Auth server → signs JWT
           → exposes JWKS
           → services cache keys
           → local verification
```

---

## 11. Key Architectural Decisions

---

### 11.1 Modular Monolith

- single deployable backend
- domain separation internally

---

### 11.2 No Repository Layer

- Drizzle used directly

---

### 11.3 No Event Bus (V1)

- direct module calls only

---

### 11.4 PostgreSQL Only

- no Redis in V1

---

### 11.5 PNPM Workspaces

- multi-app monorepo
- contract sharing via packages/shared

---

## 12. Security Architecture

- Asymmetric JWT (RS256)
- JWKS-based verification
- hashed refresh tokens
- strict validation layer
- full audit logging

---

## 13. Scalability Model

- stateless API
- horizontal scaling
- PostgreSQL primary scaling boundary
- JWKS caching

---

## Final System Definition

> A pnpm-workspace-based modular monolith identity platform implementing OIDC-style flows, with a strict separation between backend runtime logic (`api/shared`) and cross-app contracts (`packages/shared`), enabling scalable, secure, and consistent authentication across multiple first-party applications.

---

## What was fixed (important)

- ✔ added `packages/shared`
- ✔ clarified contract vs runtime separation
- ✔ fixed monorepo structure consistency
- ✔ aligned pnpm workspace reality with architecture
- ✔ removed ambiguity in shared layers
- ✔ made it implementation-safe

---
