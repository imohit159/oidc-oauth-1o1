import { jwtVerify } from "jose";

import { JwksService } from "../jwks/jwks.service.js";
import { ZenAuthError } from "../../shared/errors/zen-auth-error.js";
import type { AccessTokenClaims } from "../../shared/types/claims.types.js";

export class AccessTokenService {
  static async verify(
    issuer: string,
    accessToken: string,
  ): Promise<AccessTokenClaims> {
    if (!accessToken) {
      throw ZenAuthError.missingToken("access_token is required");
    }

    try {
      const keySet = await JwksService.getKeySet(issuer);
      const { payload } = await jwtVerify(accessToken, keySet, {
        algorithms: ["RS256"],
      });

      if (typeof payload.sub !== "string") {
        throw ZenAuthError.invalidToken("access_token missing sub claim");
      }

      return payload as AccessTokenClaims;
    } catch (error) {
      if (error instanceof ZenAuthError) {
        throw error;
      }
      throw ZenAuthError.invalidToken(
        error instanceof Error ? error.message : "Invalid access_token",
      );
    }
  }
}
