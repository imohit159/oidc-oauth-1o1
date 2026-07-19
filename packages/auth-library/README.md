# @zen/auth-library

Sign in with Zen — Node.js OAuth 2.0 / OIDC client, inspired by [google-auth-library](https://googleapis.dev/nodejs/google-auth-library/5.6.1/).

Framework-agnostic. Use from Express, Fastify, or plain Node. This package does **not** manage cookies or app sessions; after `verifyIdToken`, create your own session.

## Install

```bash
pnpm add @zen/auth-library
```

In this monorepo:

```bash
pnpm --filter @zen/auth-library build
```

## Environment

| Variable | Description |
|----------|-------------|
| `ZEN_ISSUER` | Zen IdP base URL (e.g. `http://localhost:8000`) |
| `ZEN_CLIENT_ID` | OAuth client id from the Zen developer portal |
| `ZEN_CLIENT_SECRET` | Client secret (confidential clients) |
| `ZEN_REDIRECT_URI` | Registered redirect URI |

## Quick start

```ts
import { OAuth2Client } from "@zen/auth-library";

const client = new OAuth2Client({
  issuer: process.env.ZEN_ISSUER!,
  clientId: process.env.ZEN_CLIENT_ID!,
  clientSecret: process.env.ZEN_CLIENT_SECRET,
  redirectUri: process.env.ZEN_REDIRECT_URI!,
});

client.on("tokens", (tokens) => {
  // Persist refresh_token on rotation
});
```

### 1. Start login (PKCE)

```ts
const { url, codeVerifier, state } = await client.generateAuthUrl({
  scope: ["openid", "profile", "email"],
  access_type: "offline", // adds offline_access for refresh_token
});

// Store codeVerifier + state in your HttpOnly cookie / session
// Then redirect the browser to `url`
```

### 2. Callback — exchange code

```ts
const { tokens } = await client.getToken({
  grant_type: "authorization_code",
  code,
  codeVerifier,
});
// setCredentials is called automatically by getToken for auth code

const ticket = await client.verifyIdToken({
  idToken: tokens.id_token!,
  audience: process.env.ZEN_CLIENT_ID!,
});

const user = ticket.getPayload(); // sub, given_name, ...
// Create YOUR app session here
```

### 3. Authenticated requests (auto-refresh)

```ts
client.setCredentials(storedTokens);

const res = await client.request({
  url: `${process.env.ZEN_ISSUER}/api/v1/oauth/userinfo`,
});
```

### 4. Verify access tokens (resource server)

```ts
const claims = await client.verifyAccessToken(accessToken);
// claims.sub, claims.scope, claims.client_id, ...
```

## Express sketch

```ts
app.get("/auth/login", async (req, res) => {
  const { url, codeVerifier, state } = await client.generateAuthUrl({
    scope: ["openid", "profile", "email"],
    access_type: "offline",
  });
  // stash codeVerifier + state
  res.redirect(url);
});

app.get("/auth/callback", async (req, res) => {
  const { tokens } = await client.getToken({
    grant_type: "authorization_code",
    code: String(req.query.code),
    codeVerifier, // from your store
  });
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.ZEN_CLIENT_ID!,
  });
  // create YOUR session from ticket.getPayload()
  res.redirect("/dashboard");
});
```

See [`examples/`](./examples/) for more.

## API surface

| Method | Purpose |
|--------|---------|
| `generateAuthUrl` | Authorize URL + PKCE `codeVerifier` |
| `getToken` | Token endpoint (`authorization_code`, `refresh_token`; `client_credentials` reserved) |
| `setCredentials` / `credentials` | In-memory token bag |
| `refreshAccessToken` | Explicit refresh (handles rotation) |
| `request` | Bearer fetch with refresh-on-expiry/401 |
| `verifyIdToken` | JWKS-verify ID token → `LoginTicket` |
| `verifyAccessToken` | JWKS-verify access token claims |
| `on("tokens")` | Fired when credentials change |

Discovery is loaded from `{issuer}/.well-known/openid-configuration`.

## Out of scope (v1)

- Express `requireAuth` middleware
- `client_credentials` (use `getToken({ grant_type: "client_credentials" })` later when IdP supports it)
- Session/cookie helpers
- Google ADC / service accounts

## License

Private — monorepo package.
