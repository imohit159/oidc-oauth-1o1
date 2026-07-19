import { jwtVerify } from "jose";

import { JwksService } from "../jwks/jwks.service.js";
import { ZenAuthError } from "../../shared/errors/zen-auth-error.js";
import type { IdTokenClaims } from "../../shared/types/claims.types.js";
import type { VerifyIdTokenOptions } from "../../shared/types/token-request.types.js";
import { LoginTicket } from "./login-ticket.js";

export class IdTokenService {
  static async verify(
    issuer: string,
    options: VerifyIdTokenOptions,
    defaultAudience: string,
  ): Promise<LoginTicket> {
    if (!options.idToken) {
      throw ZenAuthError.invalidToken("id_token is required", "MISSING_TOKEN");
    }

    try {
      const keySet = await JwksService.getKeySet(issuer);
      const audience = options.audience ?? defaultAudience;

      const { payload } = await jwtVerify(options.idToken, keySet, {
        issuer,
        audience,
        algorithms: ["RS256"],
      });

      if (options.nonce && payload.nonce !== options.nonce) {
        throw ZenAuthError.invalidToken("id_token nonce mismatch");
      }

      return new LoginTicket(payload as IdTokenClaims);
    } catch (error) {
      if (error instanceof ZenAuthError) {
        throw error;
      }
      throw ZenAuthError.invalidToken(
        error instanceof Error ? error.message : "Invalid id_token",
      );
    }
  }
}
