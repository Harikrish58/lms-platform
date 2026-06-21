"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  LayoutDashboard,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  Save,
  Globe,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

import ImageUpload from "@/components/ui/ImageUpload";
import CurriculumBuilder from "@/components/courses/CurriculumBuilder";

interface LessonData {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  videoKey: string | null;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  pdfUrl: string | null;
  pdfPublicId: string | null;
  resources: string | null;
  order: number;
  sectionId: string;
}

interface SectionData {
  id: string;
  title: string;
  order: number;
  lessons: LessonData[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  isPublished: boolean;
  sections: SectionData[];
}

interface GeneralDetailsForm {
  title: string;
  description: string;
  price: number;
}

interface ApiErrorResponse {
  message: string;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();

  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const queryClient = useQueryClient();

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery<CourseData>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/instructor/courses/${courseId}`,
      );
      return response.data.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!courseId,
  });

  const form = useForm<GeneralDetailsForm>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = form;

  useEffect(() => {
    if (course) {
      reset({
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
      });
    }
  }, [course, reset]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateCourseMutation = useMutation({
    mutationFn: async (values: Partial<CourseData>) => {
      const response = await axiosInstance.patch(
        `/api/courses/${courseId}`,
        values,
      );
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Course updated successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["course", courseId] }),
        queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }),
      ]);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update course");
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(
        `/api/courses/${courseId}/publish`,
      );
      return response.data;
    },
    onSuccess: async (data) => {
      toast.success(data.message || "Publish status updated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["course", courseId] }),
        queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }),
      ]);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to change publish status",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-800">Unable to Load Course</h2>
        <button
          type="button"
          onClick={() => router.push("/instructor/courses")}
          className="mt-2 px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const checks = {
    hasTitle: course.title?.trim().length > 0,
    hasDescription: course.description?.trim().length > 0,
    hasThumbnail: Boolean(course.thumbnail),
    hasCurriculum: course.sections?.length > 0 && course.sections.some((s) => s.lessons.length > 0),
  };

  const isReadyToPublish = Object.values(checks).every(Boolean);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 min-h-screen pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/instructor/courses")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 font-bold mb-4 transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Course Setup
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Complete all required fields to publish your course.
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold ${
            course.isPublished
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-slate-100 border-slate-200 text-slate-600"
          }`}
        >
          {course.isPublished ? <Globe size={18} /> : <EyeOff size={18} />}
          {course.isPublished ? "Published (Live)" : "Draft Mode"}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <LayoutDashboard size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">General Details</h2>
            </div>

            <form
              onSubmit={handleSubmit((data) =>
                updateCourseMutation.mutate({ ...data, price: Number(data.price) }),
              )}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                <input
                  {...register("title", {
                    required: "Course title is required.",
                    minLength: { value: 5, message: "Title must be at least 5 characters." },
                  })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                />
                {errors.title && <p className="text-rose-500 text-xs font-bold mt-2">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  {...register("description", {
                    required: "Course description is required.",
                    minLength: { value: 10, message: "Description must be at least 10 characters." },
                  })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"
                />
                {errors.description && <p className="text-rose-500 text-xs font-bold mt-2">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Price (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required.",
                    min: { value: 0, message: "Price cannot be negative." },
                  })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                />
                {errors.price && <p className="text-rose-500 text-xs font-bold mt-2">{errors.price.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isDirty || updateCourseMutation.isPending}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {updateCourseMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ListChecks size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Curriculum</h2>
                  <p className="text-sm text-slate-500 font-medium">Create and organize course content</p>
                </div>
              </div>
            </div>

            <CurriculumBuilder initialData={course} courseId={course.id} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="text-teal-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Thumbnail</h2>
            </div>
            <ImageUpload
              endpoint="/api/upload/image"
              value={course.thumbnail || ""}
              onChange={(url) => updateCourseMutation.mutate({ thumbnail: url })}
              onRemove={() => updateCourseMutation.mutate({ thumbnail: null })}
            />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Publishing Status</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm font-medium">
                {checks.hasTitle && checks.hasDescription ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Circle className="text-slate-300" size={18} />}
                <span className={checks.hasTitle && checks.hasDescription ? "text-slate-700" : "text-slate-400"}>Basic details completed</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                {checks.hasThumbnail ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Circle className="text-slate-300" size={18} />}
                <span className={checks.hasThumbnail ? "text-slate-700" : "text-slate-400"}>Thumbnail uploaded</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium">
                {checks.hasCurriculum ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Circle className="text-slate-300" size={18} />}
                <span className={checks.hasCurriculum ? "text-slate-700" : "text-slate-400"}>At least 1 section & lesson</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => togglePublishMutation.mutate()}
                disabled={(!isReadyToPublish && !course.isPublished) || togglePublishMutation.isPending}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  course.isPublished
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {togglePublishMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : course.isPublished ? (
                  "Unpublish Course"
                ) : (
                  "Publish Course"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}