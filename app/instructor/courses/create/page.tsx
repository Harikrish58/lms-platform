"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  DollarSign,
  Type,
  AlignLeft,
} from "lucide-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

import axiosInstance from "@/lib/axios";

interface CreateCourseFormValues {
  title: string;
  description: string;
  price: number;
}

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Initial course creation page.
 * Collects the minimum information required to create a course
 * before redirecting instructors to the full course editor.
 */
export default function CreateCoursePage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateCourseFormValues>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: CreateCourseFormValues) => {
      const response = await axiosInstance.post("/api/courses", {
        ...values,
        price: Number(values.price),
      });

      return response.data;
    },

    onSuccess: (data) => {
      toast.success("Course created successfully");

      router.push(
        `/instructor/courses/${data.data.id}/edit`
      );
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(
        error.response?.data?.message ??
          "Failed to create course"
      );
    },
  });

  const onSubmit = (values: CreateCourseFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-6 md:p-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-8 flex w-fit items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft size={16} />
        Back to Courses
      </button>

      <div className="mb-10">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900">
          <BookOpen className="text-teal-600" />
          Create Course
        </h1>

        <p className="mt-2 font-medium text-slate-500">
          Add the basic details for your course. You can build the
          curriculum, upload content, and configure settings in
          the next step.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Type size={16} className="text-slate-400" />
              Course Title
            </label>

            <input
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 5,
                  message:
                    "Title must be at least 5 characters",
                },
              })}
              placeholder="e.g. Full-Stack Web Development Bootcamp"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />

            {errors.title && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <AlignLeft size={16} className="text-slate-400" />
              Description
            </label>

            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message:
                    "Description must be at least 10 characters",
                },
              })}
              rows={5}
              placeholder="What will students learn from this course?"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />

            {errors.description && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <DollarSign size={16} className="text-slate-400" />
              Price (USD)
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              {...register("price", {
                valueAsNumber: true,
                required: "Price is required",
                min: {
                  value: 0,
                  message: "Price cannot be negative",
                },
              })}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />

            {errors.price && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => router.push("/instructor/courses")}
            className="rounded-xl px-6 py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isValid || createMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3 font-bold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Creating...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}