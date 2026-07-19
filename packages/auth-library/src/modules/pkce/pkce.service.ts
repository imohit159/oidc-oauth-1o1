import { createHash, randomBytes } from "node:crypto";

import { CODE_CHALLENGE_METHODS } from "../../shared/constants.js";

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: typeof CODE_CHALLENGE_METHODS.S256;
}

export class PkceService {
  static generate(): PkcePair {
    const codeVerifier = PkceService._base64UrlEncode(randomBytes(32));
    const codeChallenge = PkceService._base64UrlEncode(
      createHash("sha256").update(codeVerifier).digest(),
    );

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: CODE_CHALLENGE_METHODS.S256,
    };
  }

  // Internal helper
  private static _base64UrlEncode(buffer: Buffer): string {
    return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
}
