import { eq } from "drizzle-orm";
import { db } from "../../config/database";
import { oauthSigningKeys } from "./models/oauth-signing-keys.model";
import { JwtService } from "../security/services/jwt.service";

export class JwksService {
  /**
   * Ensure the current active public key from environment is registered in the database.
   * This is useful for exposing it in the JWKS endpoint.
   */
  static async syncActiveKey(): Promise<void> {
    const jwk = await JwtService.getPublicJwk();
    const kid = (jwk as any).kid || "default";

    const [existingKey] = await db
      .select()
      .from(oauthSigningKeys)
      .where(eq(oauthSigningKeys.kid, kid))
      .limit(1);

    if (!existingKey) {
      await db.insert(oauthSigningKeys).values({
        kid,
        algorithm: jwk.alg || "RS256",
        publicKeyPem: JSON.stringify(jwk), // Storing the JWK JSON directly for ease of use
        status: "ACTIVE",
        activatedAt: new Date(),
      });
    }
  }

  /**
   * Get all active JSON Web Keys for the OIDC JWKS endpoint.
   */
  static async getJwks() {
    await JwksService.syncActiveKey();

    const keys = await db
      .select()
      .from(oauthSigningKeys)
      .where(eq(oauthSigningKeys.status, "ACTIVE"));

    const jwks = keys.map((keyRecord: typeof oauthSigningKeys.$inferSelect) => {
      try {
        return JSON.parse(keyRecord.publicKeyPem);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return { keys: jwks };
  }
}
