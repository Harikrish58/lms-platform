import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(4).max(100),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
