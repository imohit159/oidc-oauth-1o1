import { z } from "zod";
export const registerSchema = z.object({
  givenName: z
    .string()
    .min(1, "Given name must be at least 1 character.")
    .max(100, "Given name cannot exceed 100 characters."),
  familyName: z
    .string()
    .min(1, "Family name must be at least 1 character.")
    .max(100, "Family name cannot exceed 100 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters."),
});
export type RegisterDto = z.infer<typeof registerSchema>;
