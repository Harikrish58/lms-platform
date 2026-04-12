import { z } from "zod";

export const CreateSectionSchema = z.object({
  title: z.string().min(1).max(50),
});

export const UpdateSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const ReOrderSectionsSchema = z.object({
  sectionIds: z
    .array(z.string().min(1))
    .min(1, "At least one section ID is required"),
});
