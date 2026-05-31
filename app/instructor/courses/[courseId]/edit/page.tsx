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

// --- Strict TypeScript Interfaces ---
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
  const courseId = params.courseId as string;
  const queryClient = useQueryClient();

  // 1. Fetch Existing Course Data
  // 1. Fetch Existing Course Data
  const { data: course, isLoading } = useQuery<CourseData>({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/instructor/courses/${courseId}`,
      );
      return response.data.data;
    },
  });

  // 2. Initialize Form
  const form = useForm<GeneralDetailsForm>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  // Hydrate form when course data loads
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
      });
    }
  }, [course, form]);

  // 3. Update Mutations
  const updateCourseMutation = useMutation({
    mutationFn: async (values: Partial<CourseData>) => {
      const response = await axiosInstance.patch(
        `/api/courses/${courseId}`,
        values,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
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
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to change publish status",
      );
    },
  });

  if (isLoading || !course) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Publish Validation Logic
  const hasSections = course.sections && course.sections.length > 0;
  const hasLessons =
    course.sections && course.sections.some((s) => s.lessons.length > 0);
  const isReadyToPublish =
    course.title && course.description && hasSections && hasLessons;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen pb-24">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button
            onClick={() => router.push("/instructor/courses")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-bold mb-4 transition-colors w-fit"
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
              <LayoutDashboard className="text-indigo-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">
                General Details
              </h2>
            </div>

            <form
              onSubmit={form.handleSubmit((data) =>
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
                  {...form.register("title", { required: true, minLength: 5 })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  {...form.register("description", {
                    required: true,
                    minLength: 10,
                  })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...form.register("price", { required: true, min: 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={updateCourseMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
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
              <ImageIcon className="text-indigo-600" size={24} />
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
                <ListChecks className="text-indigo-600" size={24} />
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
            <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm font-bold bg-amber-50 p-3 rounded-lg border border-amber-100">
              <AlertTriangle size={16} />
              You must add a description and at least one lesson before
              publishing.
            </div>
          )}
        </div>

        <button
          onClick={() => togglePublishMutation.mutate()}
          disabled={
            (!isReadyToPublish && !course.isPublished) ||
            togglePublishMutation.isPending
          }
          className={`px-8 py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all min-w-[200px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            course.isPublished
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
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
