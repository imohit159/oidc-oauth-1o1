import { z } from "zod";

export const authProviderSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH", "GITHUB_OAUTH", "EMAIL_AND_PASSWORD"]),
  displayName: z.string(),
  authUrl: z.string().url().optional(),
});

export type AuthProvider = z.infer<typeof authProviderSchema>;
