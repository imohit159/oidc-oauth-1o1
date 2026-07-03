import { z } from "zod";

export const authorizeQuerySchema = z.object({
  client_id: z.string().min(1, "client_id is required"),
  redirect_uri: z.string().url("redirect_uri must be a valid URL"),
  response_type: z.literal("code", {
    invalid_type_error: "Unsupported response_type. Only 'code' is supported.",
  }),
  scope: z.string().optional(),
  state: z.string().optional(),
  code_challenge: z.string().min(1, "code_challenge is required"),
  code_challenge_method: z.enum(["plain", "S256"], {
    errorMap: () => ({ message: "code_challenge_method must be 'plain' or 'S256'" }),
  }),
  nonce: z.string().optional(),
});

export type AuthorizeQueryDto = z.infer<typeof authorizeQuerySchema>;

export const consentBodySchema = z.object({
  client_id: z.string().min(1, "client_id is required"),
  approved: z.boolean(),
  scope: z.string().optional(),
  redirect_uri: z.string().url("redirect_uri must be a valid URL"),
  code_challenge: z.string().min(1, "code_challenge is required"),
  code_challenge_method: z.enum(["plain", "S256"], {
    errorMap: () => ({ message: "code_challenge_method must be 'plain' or 'S256'" }),
  }),
  state: z.string().optional(),
  nonce: z.string().optional(),
});

export type ConsentBodyDto = z.infer<typeof consentBodySchema>;
