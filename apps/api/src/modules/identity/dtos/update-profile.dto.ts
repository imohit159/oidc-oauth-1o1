import { z } from "zod";

export const updateProfileSchema = z.object({
  givenName: z.string().min(1).max(100).optional(),
  familyName: z.string().min(1).max(100).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
