import { z } from "zod";
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
