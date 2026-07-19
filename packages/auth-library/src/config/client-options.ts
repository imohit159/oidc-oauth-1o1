import { z } from "zod";

import { ZenAuthError } from "../shared/errors/zen-auth-error.js";
import { ERROR_CODES } from "../shared/constants.js";

const clientOptionsSchema = z.object({
  issuer: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  redirectUri: z.string().url().optional(),
});

export type ClientOptionsInput = z.input<typeof clientOptionsSchema>;

export type ClientOptions = Readonly<{
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri?: string;
}>;

export const ClientOptionsConfig = {
  parse(input: ClientOptionsInput): ClientOptions {
    const parsed = clientOptionsSchema.safeParse(input);
    if (!parsed.success) {
      throw ZenAuthError.invalidOptions(
        parsed.error.errors.map((e) => e.message).join("; "),
        ERROR_CODES.INVALID_OPTIONS,
      );
    }

    return Object.freeze({
      issuer: parsed.data.issuer.replace(/\/+$/, ""),
      clientId: parsed.data.clientId,
      ...(parsed.data.clientSecret
        ? { clientSecret: parsed.data.clientSecret }
        : {}),
      ...(parsed.data.redirectUri
        ? { redirectUri: parsed.data.redirectUri }
        : {}),
    });
  },
};
