"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

interface CoursePublishActionProps {
  courseId: string;
  isPublished: boolean;
  disabled: boolean;
}

export default function CoursePublishAction({ courseId, isPublished, disabled }: CoursePublishActionProps) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`/api/courses/${courseId}/publish`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || `Course ${isPublished ? "unpublished" : "published"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["instructor-course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    },
  });

  const onClick = () => {
    publishMutation.mutate();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-slate-500">
        Status: <strong className={isPublished ? "text-emerald-600" : "text-slate-700"}>{isPublished ? "Published" : "Draft"}</strong>
      </span>
      <button
        onClick={onClick}
        disabled={disabled || publishMutation.isPending}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          isPublished 
            ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {publishMutation.isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isPublished ? (
          <XCircle size={16} />
        ) : (
          <CheckCircle size={16} />
        )}
        {isPublished ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}