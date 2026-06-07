"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Loader2,
  Layout,
  Video,
} from "lucide-react";
import * as z from "zod";
import toast from "react-hot-toast";

import axiosInstance from "@/lib/axios";
import VideoUpload from "@/components/ui/VideoUpload";

const lessonFormSchema = z.object({
  title: z.string().min(3, "Title requires at least 3 characters"),
  description: z.string().optional(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface LessonUpdatePayload
  extends Partial<LessonFormValues> {
  videoUrl?: string | null;
  videoKey?: string | null;
}

/**
 * Lesson editor for instructors.
 * Allows updating lesson metadata and associated video content.
 */
export default function EditLessonPage({
  params,
}: {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}) {
  const { courseId, lessonId } = use(params);

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const {
    data: lesson,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["instructor-lesson", lessonId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/courses/${courseId}/lessons/${lessonId}`
      );

      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!lesson) return;

    reset({
      title: lesson.title,
      description: lesson.description ?? "",
    });
  }, [lesson, reset]);

  const updateLessonMutation = useMutation({
    mutationFn: async (payload: LessonUpdatePayload) => {
      const response = await axiosInstance.patch(
        `/api/courses/${courseId}/lessons/${lessonId}`,
        payload
      );

      return response.data;
    },

    onSuccess: () => {
      toast.success("Lesson updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["instructor-lesson", lessonId],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course", courseId],
      });
    },

    onError: () => {
      toast.error("Failed to update lesson");
    },
  });

  const onSubmit = (values: LessonFormValues) => {
    updateLessonMutation.mutate(values);
  };

  const handleVideoChange = (
    videoUrl: string,
    videoKey?: string
  ) => {
    updateLessonMutation.mutate({
      videoUrl,
      videoKey: videoKey ?? null,
    });
  };

  const handleVideoRemove = () => {
    updateLessonMutation.mutate({
      videoUrl: null,
      videoKey: null,
    });
  };

  if (isLoading) {
    return (
      <div
        className="flex h-[60vh] items-center justify-center"
        aria-label="Loading lesson"
      >
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h2 className="text-lg font-bold text-slate-900">
          Unable to load lesson
        </h2>

        <p className="mt-2 text-slate-500">
          Something went wrong while loading lesson data.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 font-semibold text-teal-600 transition-colors hover:text-teal-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              router.push(
                `/instructor/courses/${courseId}/edit`
              )
            }
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Return to course editor"
          >
            <ArrowLeft size={24} />
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Edit Lesson
            </h1>

            <p className="text-sm font-medium text-slate-500">
              Configure lesson content and video resources.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Layout
                size={20}
                className="text-teal-600"
              />

              <h2 className="text-lg font-bold text-slate-900">
                Lesson Details
              </h2>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Lesson Title
                </label>

                <input
                  {...register("title")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />

                {errors.title && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Description (Optional)
                </label>

                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Provide context or supplementary notes for this lesson."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={
                  updateLessonMutation.isPending || !isDirty
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateLessonMutation.isPending ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                Save Changes
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Video
                size={20}
                className="text-teal-600"
              />

              <h2 className="text-lg font-bold text-slate-900">
                Lesson Video
              </h2>
            </div>

            <VideoUpload
              value={lesson.videoUrl ?? null}
              onChange={handleVideoChange}
              onRemove={handleVideoRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}