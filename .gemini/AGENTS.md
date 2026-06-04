for coding standards i have to write whcih coding pattern i want to use in the code
adapter, js module or singleton pattern ?
dto check on the route layer
always use utilty for api error and api res
no type any use (if there is any case - you can do it like if(!user) send api error so we always sure on the next line user will be always)

use logger utility to generate logs at relevant places no console log
always use commands like pnpm dlx create-turbo@latest oidc-oauth-1o1, pnpm i , just dont only copy paste, instal packages and its ts types dev deps the write code, if using package/shared firsst update package json then pnpm i in that dir then write code

always inbuilt modules at top then external packages
alwasy use export {}, no export default
always do the export at the bottom

naming convention
use file as like identity.model.ts and index,{module}.ts
method name as camel case

Route
↓
Controller
↓
Service
↓
Drizzle ORM
↓
PostgreSQL

Services

Services should:

- Own business logic
- Use Drizzle directly
- Throw ApiError
- Be testable
  Validation
  Zod only

Route
↓
Validation Middleware
↓
Controller

Never validate manually inside controllers.

no transaction instead usse try catch -> what i tihnk better sends immediate response and it will process in background this for sure keep api res fast

Files:
identity.service.ts
identity.controller.ts
identity.dto.ts
identity.routes.ts
identity.types.ts

Functions:
registerUser()
loginUser()

Variables:
camelCase

Types:
PascalCase

Constants:
UPPER_SNAKE_CASE

- Do not create repository layers.
- Do not create use-case layers.
- Prefer feature-module structure.
- Prefer explicit code over abstractions.
- Use Zod for validation.
- Use Drizzle directly.
- Follow API contracts exactly.
- Follow business rules exactly.
- Do not invent database fields.
- Do not invent endpoints.
