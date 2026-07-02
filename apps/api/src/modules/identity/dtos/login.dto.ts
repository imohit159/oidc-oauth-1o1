import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter a valid password"),
});
export type LoginDto = z.infer<typeof loginSchema>;
