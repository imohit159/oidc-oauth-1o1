# Project Constraints & Architecture Scope

## `oidc-oauth-1o1 — Identity Platform (“Sign in with 1o1”)`

---

## 1. Product Scope Definition (What This System Actually Is)

This project is a **single-tenant identity and authorization platform** designed to serve a controlled ecosystem of applications under a unified authentication boundary.

It functions as a **lightweight OIDC-inspired identity provider**, but with a deliberately constrained scope focused on:

* First-party applications (your ecosystem)
* Clean developer onboarding experience
* Secure token-based authentication
* Standardized authorization flows across all clients

It is not a generalized enterprise identity product.

---

## 2. System Boundary (Hard Architectural Limit)

The system is strictly divided into **three surfaces only**:

### 2.1 Backend (Core Identity Engine)

A single **modular monolith API** responsible for all identity logic:

* Authentication (login, registration)
* Token issuance (JWT access + refresh tokens)
* Token verification support (JWKS endpoint)
* Client management (app registration)
* Consent flow orchestration
* User identity + session management
* Admin operations APIs

> This is the only source of truth for identity.

---

### 2.2 Auth + Developer Web App (Unified Frontend)

A single web application serving multiple roles:

* User authentication flows (login/register)
* OAuth consent screens
* Developer portal:

  * client/app registration
  * credentials management
  * API documentation
* Basic account management

> This is NOT split into multiple frontends. It is intentionally unified.

---

### 2.3 Admin Panel (Control Plane UI)

A separate restricted interface for platform management:

* User management (basic oversight)
* Client/application approval (if needed)
* System monitoring views
* Audit logs inspection
* Key rotation controls (if exposed)

---

## 3. Explicit Non-Goals (Strict Constraints)

To maintain focus and prevent enterprise bloat:

### ❌ Not Building

* Multi-tenant SaaS identity platform
* Enterprise federation (SAML, LDAP, Active Directory)
* Social login providers (Google, GitHub, etc.) as core requirement
* SCIM provisioning systems
* Complex RBAC/ABAC engines
* Distributed identity infrastructure
* Cross-region identity replication
* High-scale global authentication network

---

## 4. Identity Model Constraints

### 4.1 Token Strategy (Mandatory)

* Asymmetric JWT signing only
* Private key remains inside auth backend
* Public key exposed via JWKS endpoint
* Services NEVER call auth service for verification in runtime path

### 4.2 Token Types

* Access Token (short-lived)
* Refresh Token (rotating + hashed storage)
* Optional ID Token (OIDC-style identity claims)

### 4.3 Trust Model

* Microservices trust identity via signature verification only
* No runtime dependency on auth service for request validation

---

## 5. Client Model Constraints

The system must support 3 explicit client types:

### 5.1 Confidential Clients

* Backend web applications
* Can securely store secrets
* Can perform server-side token exchange

### 5.2 Public Clients

* SPA applications
* Mobile apps (Expo / React Native)
* Cannot securely store secrets
* Use PKCE-style flows (simplified where needed)

### 5.3 Machine Clients

* Service-to-service applications
* Cron jobs, workers, backend automation
* Use client credentials flow

---

## 6. Consent System Constraint

Consent is a **first-class workflow**, not optional UI logic:

* Every OAuth authorization request goes through consent layer
* Consent is tied to:

  * user
  * client application
  * requested scopes
* Consent history is stored and auditable

Even if all apps are internal, consent remains:

> a structural part of the authorization model

---

## 7. Architecture Style Constraint

### Backend Architecture

* Modular monolith (NOT microservices)
* Strict domain boundaries:

  * auth module
  * users module
  * clients module
  * tokens module
  * consent module
  * admin module

### Design Principles

* Stateless request handling where possible
* Domain-driven boundaries (not layered spaghetti services)
* Clear separation of:

  * identity logic
  * authorization logic
  * infrastructure concerns

---

## 8. Scalability Constraint (Realistic Scale Model)

This system is designed for:

* Internal ecosystem scale (not public global identity provider scale)
* Thousands → hundreds of thousands of users
* Multiple first-party applications
* Moderate authentication traffic

Scaling strategy:

* Horizontal scaling of backend API
* PostgreSQL as system of record
* Redis optional for caching sessions, rate limits
* JWKS caching to remove runtime auth dependency
* No distributed identity clusters required

---

## 9. Security Constraint (Production-Grade Baseline)

Mandatory security expectations:

* Asymmetric JWT signing (RS256 or equivalent)
* Key rotation via JWKS (`kid` based)
* Hashed refresh tokens (never stored raw)
* Short-lived access tokens
* Strict input validation layer (DTO enforcement)
* Audit logging for all sensitive actions
* Least-privilege token claims model

No advanced enterprise security systems are required, but fundamentals must be correct and consistent.

---

## 10. Frontend Constraint (Unified UX Principle)

Frontend is intentionally simplified:

* One unified auth + developer portal
* One admin panel
* No fragmentation of developer experience
* No separate documentation system outside developer portal

UX principle:

> Developers should not need to understand internal system boundaries to use the platform.

---

## 11. Deployment Constraint

* Single-region deployment initially
* Containerized backend
* Simple CI/CD pipeline (build → test → deploy)
* Environment-based configuration only
* No multi-cloud or active-active infrastructure

---

## 12. Product Philosophy Constraint (Most Important)

This system is:

> A **controlled identity layer for your ecosystem**, designed to feel like a mini “Sign in with X” provider, but optimized for clarity, correctness, and maintainability rather than enterprise identity complexity.

Key philosophy:

* Optimize for **correct architecture first**
* Avoid premature scaling complexity
* Prefer **clear boundaries over flexible abstraction**
* Treat identity as a **core infrastructure product**, not just a feature

---

## Final Architectural Summary

You are building:

> A modular monolith-based, OIDC-inspired identity platform that supports multiple client types, secure JWT-based authentication, consent-driven authorization flows, and a unified developer experience — designed for a controlled ecosystem rather than a public enterprise identity provider.

---