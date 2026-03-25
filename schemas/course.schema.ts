import { z } from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  instructorId: z.string().uuid("Instructor ID must be a valid UUID"),
});
