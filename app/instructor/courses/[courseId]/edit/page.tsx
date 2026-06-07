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
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

import ImageUpload from "@/components/ui/ImageUpload";
import CurriculumBuilder from "@/components/courses/CurriculumBuilder";

// Strict TypeScript Interfaces
interface LessonData {
  id: string;
  title: string;
  order: number;
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

  // Defensive type checking for dynamic route params
  const courseId = typeof params.courseId === "string" ? params.courseId : "";
  const queryClient = useQueryClient();

  // 1. Fetch Existing Course Data
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
      const courseData: CourseData = response.data.data;
      return courseData;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!courseId, // Prevent fetching if courseId is somehow empty
  });

  // 2. Initialize Form
  const form = useForm<GeneralDetailsForm>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = form;

  // Hydrate form when course data loads or updates
  useEffect(() => {
    if (course) {
      reset({
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
      });
    }
  }, [course, reset]);

  // Unsaved Changes Warning
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

  // 3. Update Mutations
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
      toast.success(data.message);
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

  // Distinct Loading and Error States
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
        <h2 className="text-xl font-bold text-slate-800">
          Unable to Load Course
        </h2>
        <p className="text-slate-500 max-w-md">
          We couldn&apos;t retrieve this course. It may have been deleted,
          moved, or you may not have permission to access it.
        </p>
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

  // Publish Validation Logic
  const hasSections = course.sections.length > 0;
  const hasLessons = course.sections.some((s) => s.lessons.length > 0);
  const hasThumbnail = Boolean(course.thumbnail);

  const isReadyToPublish =
    course.title.trim().length > 0 &&
    course.description.trim().length > 0 &&
    hasThumbnail &&
    hasSections &&
    hasLessons;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen pb-24">
      {/* Header & Status */}
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
            Complete all fields to publish your course.
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold ${
            course.isPublished
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          {course.isPublished ? <Globe size={18} /> : <EyeOff size={18} />}
          {course.isPublished ? "Published" : "Draft Mode"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: General Details & Image */}
        <div className="space-y-8">
          {/* General Details Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <LayoutDashboard className="text-teal-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">
                General Details
              </h2>
            </div>

            <form
              onSubmit={handleSubmit((data) =>
                updateCourseMutation.mutate({
                  ...data,
                  price: Number(data.price),
                }),
              )}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Course Title
                </label>
                <input
                  {...register("title", {
                    required: "Course title is required.",
                    minLength: {
                      value: 5,
                      message: "Title must be at least 5 characters.",
                    },
                  })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
                {errors.title && (
                  <p className="text-rose-500 text-xs font-medium mt-1.5">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description", {
                    required: "Course description is required.",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters.",
                    },
                  })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
                />
                {errors.description && (
                  <p className="text-rose-500 text-xs font-medium mt-1.5">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required.",
                    min: {
                      value: 0,
                      message: "Price cannot be negative.",
                    },
                  })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
                {errors.price && (
                  <p className="text-rose-500 text-xs font-medium mt-1.5">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                aria-busy={updateCourseMutation.isPending}
                disabled={!isDirty || updateCourseMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateCourseMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Details
              </button>
            </form>
          </div>

          {/* Thumbnail Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <ImageIcon className="text-teal-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">
                Course Thumbnail
              </h2>
            </div>

            <ImageUpload
              endpoint="/api/upload/image"
              value={course.thumbnail || ""}
              onChange={(url) =>
                updateCourseMutation.mutate({ thumbnail: url })
              }
              onRemove={() => updateCourseMutation.mutate({ thumbnail: null })}
            />
          </div>
        </div>

        {/* Right Column: Curriculum */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <ListChecks className="text-teal-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800">Curriculum</h2>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-6 font-medium">
              Create sections and lessons. Click Edit on a lesson to upload its
              video and PDF resources.
            </p>

            <CurriculumBuilder initialData={course} courseId={course.id} />
          </div>
        </div>
      </div>

      {/* Footer: Publish Action */}
      <div className="mt-12 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-900">
            Visibility Status
          </h3>
          <p className="text-slate-500 font-medium mt-1">
            {course.isPublished
              ? "Your course is currently live and visible to students."
              : "Your course is hidden. Publish it to make it available."}
          </p>

          {!isReadyToPublish && !course.isPublished && (
            <div className="mt-3 flex items-start gap-2 text-amber-700 text-sm font-bold bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>
                Please complete the title, description, thumbnail, and add at
                least one section with a lesson before publishing.
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => togglePublishMutation.mutate()}
          aria-busy={togglePublishMutation.isPending}
          disabled={
            (!isReadyToPublish && !course.isPublished) ||
            togglePublishMutation.isPending
          }
          className={`px-8 py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all min-w-[200px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            course.isPublished
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {togglePublishMutation.isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : course.isPublished ? (
            "Unpublish Course"
          ) : (
            "Publish Course"
          )}
        </button>
      </div>
    </div>
  );
}
