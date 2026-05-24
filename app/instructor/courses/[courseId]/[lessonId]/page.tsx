"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Layout, Video } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import VideoUpload from "@/components/ui/VideoUpload";

const lessonFormSchema = z.object({
  title: z.string().min(3, "Title requires at least 3 characters"),
  description: z.string().optional(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

export default function EditLessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: { title: "", description: "" },
  });

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["instructor-lesson", lessonId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/courses/${courseId}/lessons/${lessonId}`);
      return response.data.data;
    },
  });

  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        description: lesson.description || "",
      });
    }
  }, [lesson, form]);

  const updateLessonMutation = useMutation({
    mutationFn: async (values: Partial<LessonFormValues> & { videoUrl?: string | null; videoKey?: string | null }) => {
      const response = await axiosInstance.patch(`/api/courses/${courseId}/lessons/${lessonId}`, values);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lesson updated successfully");
      queryClient.invalidateQueries({ queryKey: ["instructor-lesson", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    },
    onError: () => {
      toast.error("Failed to update lesson data");
    },
  });

  const onSubmit = (values: LessonFormValues) => {
    updateLessonMutation.mutate(values);
  };

  const handleVideoChange = (url: string, key?: string) => {
    updateLessonMutation.mutate({ videoUrl: url, videoKey: key || null });
  };

  const handleVideoRemove = () => {
    updateLessonMutation.mutate({ videoUrl: null, videoKey: null });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/instructor/courses/${courseId}/edit`)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            aria-label="Return to course setup"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Edit Lesson</h1>
            <p className="text-sm text-slate-500 font-medium">Configure video content and details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <Layout size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold">Lesson Details</h2>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Lesson Title</label>
                <input
                  {...form.register("title")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                <textarea
                  {...form.register("description")}
                  rows={6}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Provide context or supplementary notes for this lesson."
                />
              </div>

              <button
                type="submit"
                disabled={updateLessonMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                {updateLessonMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <Video size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold">Lesson Video</h2>
            </div>
            <VideoUpload 
              value={lesson?.videoUrl || null}
              onChange={handleVideoChange}
              onRemove={handleVideoRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}