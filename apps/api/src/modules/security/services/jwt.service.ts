import { SignJWT, jwtVerify, importPKCS8, importSPKI, exportJWK } from "jose";
import type { JWTPayload } from "jose";

import { authConfig } from "../../../config/auth";

export class JwtService {
  private static privateKey: any = null;
  private static publicKey: any = null;

  static async init(): Promise<void> {
    JwtService.privateKey = await importPKCS8(authConfig.privateKey, "RS256") as any;
    JwtService.publicKey = await importSPKI(authConfig.publicKey, "RS256") as any;
  }

  static async signAccessToken(payload: JWTPayload, expiresIn = authConfig.accessTokenExpiresIn): Promise<string> {
    if (!JwtService.privateKey) {
      await JwtService.init();
    }

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(JwtService.privateKey!);

    return jwt;
  }

  static async verifyAccessToken<T extends JWTPayload = JWTPayload>(token: string): Promise<T> {
    if (!JwtService.publicKey) {
      await JwtService.init();
    }

    const { payload } = await jwtVerify<T>(token, JwtService.publicKey!, {
      algorithms: ["RS256"],
    });

    return payload;
  }

  static async getPublicJwk(): Promise<JsonWebKey> {
    if (!JwtService.publicKey) {
      await JwtService.init();
    }

    const jwk = await exportJWK(JwtService.publicKey!);
    jwk.alg = "RS256";
    jwk.use = "sig";
    jwk.kid = "default";

    return jwk;
  }
}
