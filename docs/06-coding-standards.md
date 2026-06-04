# 07-coding-standards.md

# oidc-oauth-1o1 — Coding Standards

---

# 1. Core Principles

The codebase prioritizes:

- Simplicity over abstraction
- Explicitness over magic
- Readability over cleverness
- Consistency over personal preference

The architecture is a modular monolith and all code must follow the established module boundaries.

---

# 2. Architectural Pattern

Primary Architecture:

```txt
Route
  ↓
Validation Middleware
  ↓
Controller
  ↓
Service
  ↓
Drizzle ORM
  ↓
PostgreSQL
```

Rules:

- Controllers must not contain business logic.
- Services own business logic.
- Services interact directly with Drizzle.
- Controllers must never execute database queries.
- Controllers must never call other controllers.
- Services may call other services when required.

---

# 3. Module Pattern

Feature-module-first architecture.

Example:

```txt
identity/
├── identity.controller.ts
├── identity.service.ts
├── identity.dto.ts
├── identity.types.ts
├── identity.routes.ts
└── index.identity.ts
```

Every module follows the same structure.

---

# 4. Design Patterns

Primary Pattern:

- Feature Module Pattern

Application Layer:

- Controller-Service Pattern

Infrastructure Layer:

- Singleton Pattern where appropriate

Examples:

- logger
- database
- config

External Integrations:

- Adapter Pattern

Examples:

- google.adapter.ts
- github.adapter.ts
- resend.adapter.ts

---

# 5. TypeScript Standards

Strict TypeScript is required.

Rules:

- No any
- No unknown without narrowing
- Prefer explicit typing
- Prefer inferred types when obvious

Bad:

```ts
const user: any = {};
```

Good:

```ts
const user: User = {};
```

---

# 6. Validation Standards

Validation library:

```txt
Zod
```

Validation flow:

```txt
Route
  ↓
Validation Middleware
  ↓
Controller
```

Rules:

- Never validate manually inside controllers.
- Never validate manually inside services.
- DTO schemas are the source of truth.

---

# 7. Error Handling Standards

Use centralized ApiError utility.

Examples:

```ts
throw ApiError.badRequest(...)
throw ApiError.unauthorized(...)
throw ApiError.forbidden(...)
throw ApiError.notFound(...)
throw ApiError.conflict(...)
```

Rules:

- Never throw generic Error for business logic.
- All application errors must be standardized.

---

# 8. API Response Standards

Use centralized ApiResponse utility.

Rules:

- All successful responses use ApiResponse.
- Response shapes must follow API contracts.
- Controllers should not manually build response structures.

---

# 9. Database Standards

Database access:

```txt
Service
  ↓
Drizzle
```

Rules:

- No Repository Pattern.
- No Data Access Layer abstraction.
- Use Drizzle directly inside services.
- Database schema is defined only in Drizzle schema files.

---

# 10. Transactions

Use transactions only when multiple database writes must succeed or fail together.

Example:

```txt
Create User
Create Identity
Create Session
```

Use:

```ts
db.transaction(...)
```

Avoid unnecessary transactions.

---

# 11. Logging Standards

Use logger utility.

Rules:

- No console.log
- No console.error
- No console.warn

Use:

```ts
logger.info(...)
logger.warn(...)
logger.error(...)
```

Log:

- authentication events
- security events
- failures
- critical business operations

Avoid excessive logging.

---

# 12. Import Order

Always follow:

```txt
1. Node.js built-in modules
2. External packages
3. Internal aliases
4. Relative imports
```

Example:

```ts
import crypto from "node:crypto";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { ApiError } from "@/shared/utils/api-error.util";

import { users } from "./users.model";
```

---

# 13. Export Rules

Rules:

- No default exports.
- Use named exports only.
- Export at the bottom of the file whenever practical.

Good:

```ts
class IdentityService {}

export { IdentityService };
```

---

# 14. Naming Conventions

Files:

```txt
identity.controller.ts
identity.service.ts
identity.dto.ts
identity.types.ts
identity.routes.ts
identity.model.ts
index.identity.ts
```

Functions:

```txt
registerUser()
loginUser()
verifyEmail()
```

Variables:

```txt
camelCase
```

Types:

```txt
PascalCase
```

Enums:

```txt
PascalCase
```

Constants:

```txt
UPPER_SNAKE_CASE
```

Database Tables:

```txt
snake_case
```

Database Columns:

```txt
snake_case
```

---

# 15. Service Design Rules

Rules:

- One responsibility per method.
- Keep methods focused.
- Prefer small methods over large methods.
- Services should remain testable.

Good:

```ts
registerUser();
loginUser();
createSession();
```

Bad:

```ts
handleUserLifecycle();
```

---

# 16. Forbidden Patterns

Do not create:

- Repository Layer
- Use Case Layer
- Service Locator Pattern
- Global State Containers
- Premature Generic Abstractions

Avoid creating layers that provide no clear value.

---

# 17. Source of Truth

Always follow:

1. Database Design
2. Business Rules
3. API Contracts
4. Coding Standards

Implementation must never contradict these documents.
