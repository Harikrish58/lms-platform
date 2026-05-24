"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Layout, Image as ImageIcon, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

// Components
import CurriculumBuilder from "@/components/courses/CurriculumBuilder";
import ImageUpload from "@/components/ui/ImageUpload";
import CoursePublishAction from "@/components/courses/CoursePublishAction";

const courseFormSchema = z.object({
  title: z.string().min(3, "Title requires at least 3 characters"),
  description: z.string().min(10, "Description requires at least 10 characters"),
  price: z.number().min(0, "Price cannot be negative"),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: { title: "", description: "", price: 0 },
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ["instructor-course", courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/instructor/courses/${courseId}`);
      return response.data.data;
    },
  });

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        price: course.price,
      });
    }
  }, [course, form]);

  const updateCourseMutation = useMutation({
    mutationFn: async (values: Partial<CourseFormValues> & { thumbnail?: string | null }) => {
      const response = await axiosInstance.patch(`/api/instructor/courses/${courseId}`, values);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Course updated");
      queryClient.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    },
    onError: () => {
      toast.error("Failed to update course");
    },
  });

  const onSubmit = (values: CourseFormValues) => {
    updateCourseMutation.mutate(values);
  };

  const handleThumbnailChange = (url: string) => {
    updateCourseMutation.mutate({ thumbnail: url });
  };

  const handleThumbnailRemove = () => {
    updateCourseMutation.mutate({ thumbnail: null });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isComplete = course?.title && course?.description && course?.sections?.length > 0;

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      {!isComplete && (
        <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Course is incomplete</h4>
            <p className="text-sm mt-1">To publish this course, you must provide a title, description, and at least one section with a lesson.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/instructor/courses")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Course Setup</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your curriculum and settings</p>
          </div>
        </div>

        <CoursePublishAction 
          courseId={courseId} 
          isPublished={course?.isPublished || false} 
          disabled={!isComplete} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* General Details Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <Layout size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold">General Details</h2>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Course Title</label>
                <input
                  {...form.register("title")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  {...form.register("description")}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  {...form.register("price", { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                {form.formState.errors.price && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{form.formState.errors.price.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={updateCourseMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                {updateCourseMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Details
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          {/* Thumbnail Uploader */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <ImageIcon size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold">Course Thumbnail</h2>
            </div>
            <ImageUpload 
              value={course?.thumbnail || null}
              onChange={handleThumbnailChange}
              onRemove={handleThumbnailRemove}
            />
          </div>

          {/* Curriculum Builder Integration */}
          <CurriculumBuilder 
            courseId={courseId} 
            initialSections={course?.sections || []} 
          />
        </div>
      </div>
    </div>
  );
}