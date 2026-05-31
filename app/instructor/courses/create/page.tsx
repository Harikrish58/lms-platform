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
  AlignLeft
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

// Strictly typing our form values to match course.schema.ts
interface CreateCourseFormValues {
  title: string;
  description: string;
  price: number;
}

// Strictly typing our expected API error response
interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export default function CreateCoursePage() {
  const router = useRouter();

  const form = useForm<CreateCourseFormValues>({
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: CreateCourseFormValues) => {
      // Ensure price is parsed as a number before sending to the API
      const payload = { ...values, price: Number(values.price) };
      const response = await axiosInstance.post("/api/courses", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Course initialized successfully!");
      // Route to the edit page where they can add Curriculum and Media
      router.push(`/instructor/courses/${data.data.id}/edit`);
    },
    // Strictly typing the error instead of using 'any'
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || "Failed to create course";
      toast.error(errorMessage);
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 min-h-screen">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <BookOpen className="text-indigo-600" />
          Name your Course
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Fill out the foundational details for your new course. You can upload videos and build the curriculum in the next step.
        </p>
      </div>

      <form 
        onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
        className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8"
      >
        <div className="space-y-6">
          
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Type size={16} className="text-slate-400" /> Course Title
            </label>
            <input
              {...form.register("title", { 
                required: "Title is required", 
                minLength: { value: 5, message: "Title must be at least 5 characters" } 
              })}
              placeholder="e.g. Full-Stack Web Development Bootcamp"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-xs font-bold mt-2">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <AlignLeft size={16} className="text-slate-400" /> Description
            </label>
            <textarea
              {...form.register("description", { 
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" }
              })}
              rows={4}
              placeholder="What will your students learn in this course?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-xs font-bold mt-2">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <DollarSign size={16} className="text-slate-400" /> Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...form.register("price", { 
                required: "Price is required", 
                min: { value: 0, message: "Price cannot be negative" } 
              })}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
            {form.formState.errors.price && (
              <p className="text-red-500 text-xs font-bold mt-2">{form.formState.errors.price.message}</p>
            )}
          </div>

        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/instructor/courses")}
            className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || !form.watch("title") || !form.watch("description")}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "Save & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}