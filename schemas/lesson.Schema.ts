import z from "zod";

export const CreateLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  resources: z.string().optional(),
});

export const UpdateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  videoUrl: z.string().nullable().optional(),
  videoKey: z.string().nullable().optional(),
  resources: z.string().optional(),
});

export const ReorderLessonsSchema = z.object({
  lessonIds: z.array(z.string().min(1)).min(1, "Lesson IDs are required"),
});
