import { z } from "zod";

export const createOAuthClientSchema = z.object({
  name: z.string().min(1, "Client name is required").max(100),
  description: z.string().max(500).optional(),
  clientType: z.enum(["CONFIDENTIAL", "PUBLIC", "MACHINE"]),
  allowedGrantTypes: z.array(
    z.enum(["authorization_code", "client_credentials", "refresh_token"]),
  ).min(1, "At least one grant type is required"),
  redirectUris: z.array(z.string().url()).min(1, "At least one redirect URI is required"),
});

export type CreateOAuthClientDto = z.infer<typeof createOAuthClientSchema>;

export const updateOAuthClientSchema = createOAuthClientSchema.partial().omit({
  clientType: true, // Cannot change client type after creation
});

export type UpdateOAuthClientDto = z.infer<typeof updateOAuthClientSchema>;
