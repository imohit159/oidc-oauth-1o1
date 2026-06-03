# `03-database-design.md`

## `oidc-oauth-1o1 — Database Design`

---

## 1. Database Design Goal

The database must support a **single-tenant identity platform** with:

* email/password authentication
* Google login
* GitHub login
* auto-linking of identities by verified email
* OIDC-style authorization flows
* multi-session support
* refresh token rotation
* client registration
* consent persistence
* JWKS key rotation
* audit retention with cleanup
* simple but production-grade security controls

The database is the **source of truth** for identity, sessions, clients, consent, and audit history.

---

## 2. Database Principles

### 2.1 PostgreSQL only

PostgreSQL is the only persistence layer for V1.

### 2.2 UUID primary keys

All core tables use `uuid` primary keys.

### 2.3 Soft delete where it matters

Users and clients use soft delete semantics.

### 2.4 Separate account from authentication method

A human account is not the same thing as a login method.

* `users` = the human account
* `user_identities` = authentication methods attached to that account

### 2.5 No usernames

The system uses:

* `given_name`
* `family_name`

The frontend may present them as first name / last name.

### 2.6 Minimal but explicit security state

Security-sensitive runtime data like sessions, refresh tokens, authorization codes, login throttles, and signing keys must be persisted explicitly.

---

## 3. Domain-to-Table Mapping

| Domain   | Tables                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Identity | `users`, `user_identities`, `auth_action_tokens`, `login_throttles`                                                |
| OAuth    | `oauth_clients`, `oauth_client_redirect_uris`, `oauth_authorization_codes`, `oauth_consents`, `oauth_signing_keys` |
| Sessions | `sessions`, `refresh_tokens`                                                                                       |
| Audit    | `audit_logs`                                                                                                       |

---

## 4. Core Tables

---

### 4.1 `users`

This is the core human account table.

#### Purpose

Stores the base user record independent of login method.

#### Suggested columns

* `id` uuid PK
* `given_name` text
* `family_name` text
* `created_at` timestamptz
* `updated_at` timestamptz
* `deleted_at` timestamptz nullable

#### Notes

* This table should not store provider-specific login data.
* Soft delete is used for account removal.
* `given_name` and `family_name` may be nullable at the database level if you want flexibility for social sign-in flows, but the registration flow can require them.

---

### 4.2 `user_identities`

This table stores authentication methods linked to a user.

#### Purpose

Represents how a user can sign in.

#### Suggested columns

* `id` uuid PK
* `user_id` uuid FK → `users.id`
* `provider` enum/text
  Values:

  * `PASSWORD`
  * `GOOGLE`
  * `GITHUB`
* `provider_subject` text nullable
  Used for Google/GitHub provider user id
* `email` text
* `email_normalized` text
* `email_verified` boolean
* `password_hash` text nullable
* `created_at` timestamptz
* `updated_at` timestamptz
* `last_used_at` timestamptz nullable
* `revoked_at` timestamptz nullable

#### Rules

* `PASSWORD` identity must have `password_hash`
* `GOOGLE` / `GITHUB` identities must have `provider_subject`
* `email_normalized` must be unique across active identities
* Auto-linking works by matching verified normalized email

#### Suggested constraints

* Unique on `(provider, provider_subject)`
* Unique on `email_normalized`
* Index on `user_id`

#### Why this design works

* Clean account linking
* Easy future provider expansion
* No duplication in the `users` table
* Matches your auto-link by verified email rule

---

### 4.3 `auth_action_tokens`

This table stores one-time tokens for sensitive identity actions.

#### Purpose

Supports:

* email verification
* password reset
* future account action flows

#### Suggested columns

* `id` uuid PK
* `user_id` uuid FK → `users.id`
* `identity_id` uuid nullable FK → `user_identities.id`
* `type` enum/text
  Values:

  * `EMAIL_VERIFICATION`
  * `PASSWORD_RESET`
* `token_hash` text unique
* `expires_at` timestamptz
* `consumed_at` timestamptz nullable
* `created_at` timestamptz
* `metadata` jsonb nullable

#### Notes

* Store only hashed token values.
* A token may be tied to a specific identity row.
* This keeps email verification and password reset secure and auditable.

---

### 4.4 `login_throttles`

This table tracks temporary login lockouts.

#### Purpose

Implements:

* 5 failed attempts
* 15 minute lockout
* simple email-based throttling

#### Suggested columns

* `id` uuid PK
* `email_normalized` text unique
* `failed_attempts` integer
* `locked_until` timestamptz nullable
* `last_failed_at` timestamptz nullable
* `last_success_at` timestamptz nullable
* `created_at` timestamptz
* `updated_at` timestamptz

#### Notes

* This is a lightweight state table, not a permanent audit store.
* Reset `failed_attempts` on successful login.
* When failures reach 5, set `locked_until = now() + interval '15 minutes'`.

---

## 5. OAuth / OIDC Tables

---

### 5.1 `oauth_clients`

Represents registered applications.

#### Purpose

Stores OAuth client metadata and ownership.

#### Suggested columns

* `id` uuid PK
* `client_id` text unique
* `owner_user_id` uuid FK → `users.id`
* `name` text
* `description` text nullable
* `client_type` enum/text
  Values:

  * `CONFIDENTIAL`
  * `PUBLIC`
  * `MACHINE`
* `allowed_grant_types` text[]
  Example:

  * confidential: `["authorization_code", "client_credentials"]`
  * public: `["authorization_code"]`
  * machine: `["client_credentials"]`
* `client_secret_hash` text nullable
* `client_secret_last_shown_at` timestamptz nullable
* `client_secret_rotated_at` timestamptz nullable
* `status` enum/text
  Values:

  * `ACTIVE`
  * `SUSPENDED`
  * `DELETED`
* `created_at` timestamptz
* `updated_at` timestamptz
* `deleted_at` timestamptz nullable

#### Rules

* Every client must have an owner.
* Client secret is shown only once.
* Client secret is stored hashed.

#### Notes

* Public clients should not have a secret.
* Machine clients are still owned by a user.

---

### 5.2 `oauth_client_redirect_uris`

Stores allowed redirect URIs per client.

#### Purpose

Supports multiple redirect URIs per client.

#### Suggested columns

* `id` uuid PK
* `client_id` uuid FK → `oauth_clients.id`
* `redirect_uri` text
* `created_at` timestamptz

#### Constraints

* Unique on `(client_id, redirect_uri)`

#### Notes

* This table keeps redirect validation clean and extensible.
* Keep logout redirect URIs out of V1 unless needed later.

---

### 5.3 `oauth_authorization_codes`

Stores authorization codes for Authorization Code + PKCE flow.

#### Purpose

One-time, short-lived authorization code storage.

#### Suggested columns

* `id` uuid PK
* `code_hash` text unique
* `client_id` uuid FK → `oauth_clients.id`
* `user_id` uuid FK → `users.id`
* `session_id` uuid nullable FK → `sessions.id`
* `redirect_uri` text
* `code_challenge` text
* `code_challenge_method` text
* `scopes` text[]
* `nonce` text nullable
* `expires_at` timestamptz
* `consumed_at` timestamptz nullable
* `created_at` timestamptz

#### Notes

* Store only the hash of the code, never the raw code.
* Mark as consumed once exchanged for tokens.
* Use `PKCE` for public clients and as default good practice.

---

### 5.4 `oauth_consents`

Stores remembered user consent decisions.

#### Purpose

Lets the system skip consent on future logins unless scopes change.

#### Suggested columns

* `id` uuid PK
* `user_id` uuid FK → `users.id`
* `client_id` uuid FK → `oauth_clients.id`
* `scopes` text[]
* `granted_at` timestamptz
* `revoked_at` timestamptz nullable
* `last_used_at` timestamptz nullable
* `created_at` timestamptz
* `updated_at` timestamptz

#### Constraints

* Unique on `(user_id, client_id)`

#### Notes

* If requested scopes differ from stored scopes, show consent again.
* If consent is revoked, set `revoked_at`.

---

### 5.5 `oauth_signing_keys`

Stores JWT/JWKS key metadata.

#### Purpose

Supports asymmetric signing and JWKS-based verification.

#### Suggested columns

* `id` uuid PK
* `kid` text unique
* `algorithm` text
* `public_key_pem` text
* `status` enum/text
  Values:

  * `ACTIVE`
  * `PREVIOUS`
  * `REVOKED`
* `activated_at` timestamptz
* `retired_at` timestamptz nullable
* `expires_at` timestamptz nullable
* `created_at` timestamptz
* `updated_at` timestamptz

#### Notes

* Private key should not be stored in plain text.
* Current key + previous key strategy is enough for V1.
* JWKS endpoint reads from this table.

---

## 6. Session Tables

---

### 6.1 `sessions`

Represents a user’s login session.

#### Purpose

Allows multiple active sessions per user across devices and clients.

#### Suggested columns

* `id` uuid PK
* `user_id` uuid FK → `users.id`
* `client_id` uuid FK → `oauth_clients.id`
* `current_refresh_token_id` uuid nullable FK → `refresh_tokens.id`
* `device_name` text nullable
* `user_agent` text nullable
* `ip_address` inet nullable
* `created_at` timestamptz
* `last_used_at` timestamptz nullable
* `expires_at` timestamptz
* `revoked_at` timestamptz nullable
* `revoked_reason` text nullable

#### Notes

* One user can have many sessions.
* One session belongs to one client.
* Session status is derived from `revoked_at` and `expires_at`.

---

### 6.2 `refresh_tokens`

Stores refresh token history and rotation lineage.

#### Purpose

Supports rotating refresh tokens and reuse detection.

#### Suggested columns

* `id` uuid PK
* `session_id` uuid FK → `sessions.id`
* `token_jti` text unique
* `token_hash` text unique
* `parent_refresh_token_id` uuid nullable FK → `refresh_tokens.id`
* `replaced_by_refresh_token_id` uuid nullable FK → `refresh_tokens.id`
* `issued_at` timestamptz
* `expires_at` timestamptz
* `rotated_at` timestamptz nullable
* `revoked_at` timestamptz nullable
* `revoked_reason` text nullable
* `created_at` timestamptz

#### Notes

* This table gives you a full refresh-token chain.
* When a token is used, rotate it:

  * revoke old token
  * create new token
  * set `replaced_by_refresh_token_id`
* `sessions.current_refresh_token_id` points to the active token.

---

## 7. Audit Table

---

### 7.1 `audit_logs`

Stores security and administrative events.

#### Purpose

Keeps traceability for authentication, authorization, and admin activity.

#### Suggested columns

* `id` uuid PK
* `actor_user_id` uuid nullable FK → `users.id`
* `action` text
* `entity_type` text
* `entity_id` text nullable
* `ip_address` inet nullable
* `user_agent` text nullable
* `status` text nullable
* `metadata` jsonb nullable
* `created_at` timestamptz

#### Retention rule

* Keep audit logs for **30 days**
* A simple daily cron job deletes records older than 30 days

Example cleanup logic:

```sql
DELETE FROM audit_logs
WHERE created_at < now() - interval '30 days';
```

---

## 8. Relationships Overview

### User identity

* One `user` can have many `user_identities`
* One `user` can have many `sessions`
* One `user` can have many `oauth_consents`

### Client ownership

* One `user` owns many `oauth_clients`

### Session flow

* One `session` has many `refresh_tokens`
* One `session` belongs to one `user`
* One `session` belongs to one `client`

### OAuth flow

* One `oauth_client` has many redirect URIs
* One `oauth_client` has many authorization codes
* One `oauth_client` has many consents

### Security

* One `oauth_signing_keys` table stores key lifecycle metadata
* One `login_throttles` row per normalized email

---

## 9. Indexing Strategy

### High-value indexes

#### `users`

* `deleted_at`

#### `user_identities`

* unique `email_normalized`
* unique `(provider, provider_subject)`
* index `user_id`

#### `login_throttles`

* unique `email_normalized`
* index `locked_until`

#### `oauth_clients`

* unique `client_id`
* index `owner_user_id`
* index `deleted_at`

#### `oauth_client_redirect_uris`

* unique `(client_id, redirect_uri)`

#### `oauth_authorization_codes`

* unique `code_hash`
* index `client_id`
* index `user_id`
* index `expires_at`
* index `consumed_at`

#### `oauth_consents`

* unique `(user_id, client_id)`
* index `client_id`
* index `user_id`

#### `sessions`

* index `user_id`
* index `client_id`
* index `expires_at`
* index `revoked_at`

#### `refresh_tokens`

* unique `token_hash`
* unique `token_jti`
* index `session_id`
* index `expires_at`
* index `revoked_at`

#### `oauth_signing_keys`

* unique `kid`
* index `status`
* index `expires_at`

#### `audit_logs`

* index `created_at`
* index `actor_user_id`
* index `entity_type`
* index `entity_id`

---

## 10. Constraint Rules

### Identity constraints

* Email is normalized before storage
* Email must be unique across active identities
* Password identity requires password hash
* Social identities require provider subject

### Session constraints

* Refresh token must belong to one session
* Refresh token rotation must preserve lineage
* Reuse of a replaced refresh token should revoke the session

### OAuth constraints

* Authorization codes are one-time use
* Authorization codes expire quickly
* Redirect URIs must be exact-match validated
* Consent is stored per user-client pair

### Security constraints

* Signing keys must support one active and one previous key
* Audit logs are append-only during normal operation
* User lockout is temporary, not permanent

---

## 11. Retention and Cleanup Rules

### Audit logs

* Retain for 30 days
* Remove with a daily cron job

### Authorization codes

* Remove on expiration or consumption cleanup

### Refresh tokens

* Keep historical rows for rotation and security tracking
* Optionally clean very old revoked token history later if needed

### Sessions

* Expired/revoked sessions can be cleaned by scheduled maintenance job

### Login throttles

* Can be reset on successful login or left to expire naturally by lock window

---

## 12. Design Notes for Drizzle

### Recommended approach

* Model enums in shared code and DB schema together
* Use `timestamp with time zone` for all time fields
* Use `jsonb` only for metadata that is truly flexible
* Keep token hashes and code hashes one-way only
* Use foreign keys for ownership and consistency
* Avoid unnecessary join tables unless a field is truly multi-valued

### Recommended generated fields

* UUID primary keys
* `created_at` default `now()`
* `updated_at` managed by application logic or DB trigger

---

## 13. Final Schema Summary

This schema gives you:

* clean account linking
* verified-email auto-linking
* multi-provider identity support
* multiple sessions per user
* refresh token rotation
* client ownership
* consent persistence
* OIDC authorization code flow
* JWKS key rotation
* audit retention
* temporary login lockout

---

Expected Table Count

V1 total:

```bash
users
user_identities
auth_action_tokens
login_throttles

oauth_clients
oauth_client_redirect_uris

oauth_authorization_codes
oauth_consents

sessions
refresh_tokens

oauth_signing_keys

audit_logs
```

12 tables total