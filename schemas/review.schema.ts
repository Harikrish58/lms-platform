import { z } from "zod";

export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export const UpdateReviewSchema = z
  .object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().min(5).max(1000).optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "At least one of rating or comment must be provided",
  });
