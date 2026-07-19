import type { IdTokenClaims } from "../../shared/types/claims.types.js";

export class LoginTicket {
  constructor(private readonly payload: IdTokenClaims) {}

  getPayload(): IdTokenClaims {
    return this.payload;
  }

  getUserId(): string {
    return this.payload.sub;
  }
}
