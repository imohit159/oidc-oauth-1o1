/**
 * Sign in with Zen — authenticated UserInfo request with auto-refresh.
 *
 * Env:
 *   ZEN_ISSUER, ZEN_CLIENT_ID, ZEN_CLIENT_SECRET
 *   ZEN_ACCESS_TOKEN, ZEN_REFRESH_TOKEN (optional)
 */
import { OAuth2Client } from "../src/index.js";

async function main() {
  const issuer = process.env.ZEN_ISSUER!;

  const client = new OAuth2Client({
    issuer,
    clientId: process.env.ZEN_CLIENT_ID!,
    clientSecret: process.env.ZEN_CLIENT_SECRET,
  });

  client.on("tokens", (tokens) => {
    console.log("persist rotated tokens", {
      refresh_token: tokens.refresh_token ? "[redacted]" : undefined,
      expiry_date: tokens.expiry_date,
    });
  });

  client.setCredentials({
    access_token: process.env.ZEN_ACCESS_TOKEN,
    refresh_token: process.env.ZEN_REFRESH_TOKEN,
    expiry_date: process.env.ZEN_TOKEN_EXPIRY
      ? Number(process.env.ZEN_TOKEN_EXPIRY)
      : undefined,
  });

  const response = await client.request({
    url: `${issuer}/api/v1/oauth/userinfo`,
  });

  if (!response.ok) {
    throw new Error(`UserInfo failed: ${response.status}`);
  }

  console.log(await response.json());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
