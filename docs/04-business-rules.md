# 04-business-rules.md

# oidc-oauth-1o1 — Business Rules

---

# 1. Purpose

This document defines the business behavior of the identity platform.

It serves as the source of truth for:

- Services
- Controllers
- DTO validation
- Authorization decisions
- Session handling
- OAuth/OIDC flows

This document intentionally focuses on behavior rather than implementation details.

---

# 2. Identity Module

## Purpose

Responsible for authentication and identity lifecycle management.

## Responsibilities

- User registration
- User login
- Google login
- GitHub login
- Email verification
- Password reset
- Password creation
- Identity linking
- Account deletion

---

## Registration Rules

A user registers using:

- given_name
- family_name
- email
- password

Rules:

- Email must be unique
- Username is not supported
- Email is normalized before storage
- User is created immediately
- Password identity is created immediately
- Verification email is sent
- Audit event is recorded

A newly registered user:

- can login immediately
- does not need verified email to login

The system returns:

- authenticated user context
- session
- tokens

---

## Login Rules

Users login using:

- email
- password

Rules:

- Username login is not supported
- Soft deleted users cannot login
- Suspended users cannot login
- Failed login attempts are tracked

Lockout Policy:

- 5 failed attempts
- account locked for 15 minutes
- successful login resets failure counter

---

## Social Login Rules

Supported providers:

- Google
- GitHub

Rules:

- Verified provider email is trusted
- User account is created immediately
- No profile completion step

Identity Linking:

If a verified email already exists:

- automatically link identity
- do not create duplicate users

Supported combinations:

- Password + Google
- Password + GitHub
- Google + GitHub
- Password + Google + GitHub

---

## Email Verification Rules

Verification email is issued after registration.

Verification token:

- single use
- expires after 24 hours

Users may request:

- resend verification email

Successful email verification:

- marks the email as verified
- creates a new session for the user
- returns authentication tokens, logging the user in automatically

Verification is required for:

- forgot password flow

---

## Password Reset Rules

Password reset is allowed only for:

- verified email addresses

Reset token:

- single use
- expires after 1 hour

Successful password reset:

- updates password hash
- revokes all sessions
- revokes all refresh tokens
- forces reauthentication

---

## Password Creation Rules

Users authenticated only through social login may:

- create password later

This creates:

- PASSWORD identity

Existing social identities remain linked.

---

## Identity Removal Rules

Users may unlink identities.

Constraint:

At least one active identity must remain.

Examples:

Allowed:

- Password + Google → remove Google
- Password + Google → remove Password

Not Allowed:

- Google only → remove Google
- Password only → remove Password

---

## Account Deletion Rules

User deletion is implemented as soft delete.

Deletion actions:

- set deleted_at
- disable identities
- revoke sessions
- revoke refresh tokens

Audit records remain preserved.

---

# 3. Session Module

## Purpose

Responsible for authentication state and refresh token lifecycle.

---

## Session Creation Rules

Successful authentication creates:

- session
- refresh token
- access token

Multiple active sessions are allowed.

Examples:

- Desktop
- Mobile
- Tablet

---

## Access Token Rules

Lifetime:

- 15 minutes

Tokens are stateless.

---

## Refresh Token Rules

Lifetime:

- 30 days

Storage:

- hash only

Rotation:

- every refresh request generates a new refresh token

Old token becomes invalid immediately.

---

## Refresh Token Reuse Detection

If an already-used refresh token is reused:

- session is revoked
- refresh token chain is revoked
- reauthentication required

---

## Logout Rules

Logout:

- revokes current session
- revokes current refresh token chain

---

## Logout All Devices

User may revoke:

- all sessions
- all refresh tokens

User must authenticate again everywhere.

---

## Session Expiration Rules

Session expires when:

- refresh token expires

Expired refresh tokens:

- cannot be reused
- require new login

---

## Session Visibility Rules

Users may view:

- active sessions
- device name
- IP address
- user agent

Users cannot view:

- login history
- password reset history
- platform audit logs

---

# 4. OAuth Module

## Purpose

Provides OAuth 2.0 and OIDC functionality.

---

## Supported Grant Types

Supported:

- authorization_code
- refresh_token
- client_credentials

Not Supported:

- implicit
- password
- device_code

---

## PKCE Rules

Required:

- SPA clients
- Mobile clients
- Public clients

Optional:

- Confidential clients

---

## Scope Rules

Supported scopes:

- openid
- profile
- email
- offline_access

Unsupported scopes:

- rejected immediately

---

## Consent Rules

Consent is shown once.

If previously granted scopes match:

- skip consent

If new scopes requested:

- show consent again

---

## Consent Denial Rules

When user denies consent:

- no authorization code issued
- redirect with access_denied error

---

## Consent Revocation Rules

Users may revoke consent.

Revocation:

- marks consent revoked
- future authorization requires consent again

---

## Authorization Code Rules

Authorization code:

- single use
- expires after 10 minutes

Reuse is forbidden.

---

## Refresh Token Issuance Rules

Refresh token issued only when:

- offline_access granted

Otherwise:

- no refresh token issued

---

## ID Token Rules

ID token issued when:

- openid scope present

---

## UserInfo Rules

UserInfo returns claims based on granted scopes.

Supported claims:

- sub
- email
- email_verified
- given_name
- family_name

---

## OAuth Validation Rules

Reject authorization requests when:

- client disabled
- client deleted
- redirect URI invalid
- scope invalid
- PKCE invalid
- user session invalid

---

# 5. Clients Module

## Purpose

Manages applications consuming the identity platform.

---

## Client Types

Supported:

- confidential
- public
- machine

---

## Redirect URI Rules

Multiple redirect URIs allowed.

Validation:

- exact match only

Wildcards are forbidden.

---

## Client Secret Rules

Only confidential clients receive secrets.

Storage:

- hash only

Rotation:

- new secret invalidates previous secret immediately

---

## Machine Client Rules

Machine clients:

- use client_credentials flow only

No user authorization flow.

---

## Client Deletion Rules

Deletion uses soft delete.

Deleted clients:

- cannot authenticate
- cannot authorize
- remain in audit history

Ownership transfer is never supported.

---

# 6. Users Module

## Purpose

Stores profile information.

---

## Editable Fields

Users may update:

- given_name
- family_name

Email modification is not supported.

---

## Name Rules

given_name:

- 1–100 characters

family_name:

- 1–100 characters

Names are stored exactly as entered.

---

## Suspension Rules

Admins may suspend users.

Suspension actions:

- revoke all sessions
- revoke all refresh tokens
- block login
- block refresh
- block OAuth authorization

Unsuspension does not restore sessions.

User must login again.

---

# 7. Security Module

## JWT Rules

Algorithm:

- RS256

---

## Key Management Rules

JWKS exposes:

- active key
- previous key

Supports key rotation.

---

## Password Hashing Rules

Algorithm:

- Argon2id

---

## Client Secret Rules

Storage:

- hash only

---

## Security Event Rules

Audit events generated for:

- login success
- login failure
- password reset
- password change
- account deletion
- consent granted
- consent revoked
- client creation
- client deletion

---

# 8. Audit Module

## Purpose

Provides security and operational traceability.

---

## Retention Rules

Audit logs retained for:

- 30 days

Daily cleanup job removes expired records.

---

## Audit Integrity Rules

Audit logs:

- cannot be edited
- cannot be restored
- are append-only

---

## Audit Visibility Rules

Platform audit logs:

- ADMIN only

Regular users:

- cannot access audit logs

---

## Audit Metadata Rules

Each record stores:

- actor_user_id
- event_type
- resource_type
- resource_id
- ip_address
- user_agent
- metadata
- created_at

---

# 9. Notifications Module

## Purpose

Handles email communication.

---

## Supported Email Types

- Email Verification
- Password Reset

Welcome emails are not supported.

---

## Email Failure Rules

Failures:

- logged
- audited

No retry queue exists in V1.

---

## Template Rules

Shared layout:

- verification template
- password reset template

---

# 10. Admin Module

## Purpose

Provides platform administration capabilities.

---

## Roles

Supported roles:

- USER
- ADMIN

No additional roles are planned.

---

## Admin Management Rules

Admins may:

- view users
- suspend users
- unsuspend users
- soft delete users
- view identities
- view sessions

---

## Client Administration Rules

Admins may:

- view clients
- suspend clients
- unsuspend clients
- soft delete clients

---

## Session Administration Rules

Admins may:

- revoke all user sessions

---

## Email Verification Override

Admins may manually mark an email as verified.

Requirements:

- audit record required
- actor admin recorded
- target user recorded
- reason recorded

---

## Admin Protection Rules

Admins cannot delete another admin.

An admin must first be demoted.

The system must always retain at least one active admin.

---

## Configuration Rules

Admin panel does not manage:

- JWT configuration
- OAuth configuration
- Email configuration

System configuration remains environment-driven.
