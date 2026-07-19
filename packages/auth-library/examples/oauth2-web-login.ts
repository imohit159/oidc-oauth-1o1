/**
 * Sign in with Zen — web login sketch (Express-style).
 *
 * Env:
 *   ZEN_ISSUER, ZEN_CLIENT_ID, ZEN_CLIENT_SECRET, ZEN_REDIRECT_URI
 *
 * Stash codeVerifier + state in your own cookie/session between login and callback.
 */
import { OAuth2Client } from "../src/index.js";

const client = new OAuth2Client({
  issuer: process.env.ZEN_ISSUER!,
  clientId: process.env.ZEN_CLIENT_ID!,
  clientSecret: process.env.ZEN_CLIENT_SECRET,
  redirectUri: process.env.ZEN_REDIRECT_URI!,
});

client.on("tokens", (tokens) => {
  // Persist refresh_token / access_token on rotation
  console.log("tokens updated", {
    hasAccess: Boolean(tokens.access_token),
    hasRefresh: Boolean(tokens.refresh_token),
    expiry_date: tokens.expiry_date,
  });
});

export async function startLogin() {
  const { url, codeVerifier, state } = await client.generateAuthUrl({
    scope: ["openid", "profile", "email"],
    access_type: "offline",
  });

  return { url, codeVerifier, state };
}

export async function handleCallback(input: {
  code: string;
  codeVerifier: string;
  state: string;
  expectedState: string;
}) {
  if (input.state !== input.expectedState) {
    throw new Error("Invalid state");
  }

  const { tokens } = await client.getToken({
    grant_type: "authorization_code",
    code: input.code,
    codeVerifier: input.codeVerifier,
  });

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.ZEN_CLIENT_ID!,
  });

  // Create YOUR app session from ticket.getPayload()
  return {
    tokens,
    user: ticket.getPayload(),
  };
}
