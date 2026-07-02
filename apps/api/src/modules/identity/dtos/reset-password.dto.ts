import { z } from "zod";
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Password reset verification token in required"),
  password: z.string().min(8, "New Password is required"),
});
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
