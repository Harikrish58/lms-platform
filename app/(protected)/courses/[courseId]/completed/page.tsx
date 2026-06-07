"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCourseById } from "@/services/course.service";
import axios from "@/lib/axios";
import {
  Trophy,
  ArrowRight,
  CheckCircle2,
  Star,
  Download,
  Share2,
} from "lucide-react";
import { ReviewModal } from "@/components/courses/ReviewModal";

// Types
type Course = {
  id: string;
  title: string;
};

interface CourseResponse {
  data: Course;
}

interface ProgressResponse {
  data: {
    // Defines the expected progress shape
    progressPercentage?: number;
    isCompleted?: boolean;
    [key: string]: unknown;
  };
}

export default function CourseCompletedPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Fetch Course details
  const { 
    data: courseData, 
    isLoading: courseLoading,
    isError: isCourseError 
  } = useQuery<CourseResponse>({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  const course = courseData?.data;

  // Fetch Progress
  const { 
    data: progressData,
    isError: isProgressError
  } = useQuery<ProgressResponse>({
    queryKey: ["progress", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/courses/${courseId}/progress`);
      return res.data;
    },
    enabled: !!courseId,
  });

  const progress = progressData?.data;

  // Loading State
  if (courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-slate-100" />
          <div className="h-4 w-48 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  // Error State
  if (isCourseError || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <p className="mb-4 text-lg font-bold text-rose-600">
            Failed to load course details.
          </p>
          <button
            onClick={() => router.push("/courses")}
            className="font-bold text-teal-600 transition-colors hover:text-teal-700"
          >
            Return to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-12">
      <div className="relative z-10 w-full max-w-2xl rounded-[2.5rem] border border-slate-100 bg-white p-8 text-center shadow-2xl shadow-teal-100/50 md:p-16">
        
        {/* Animated Trophy Icon */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          <div className="absolute inset-0 animate-ping rounded-full bg-teal-100 opacity-20" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 to-teal-700 shadow-lg shadow-teal-200">
            <Trophy className="h-14 w-14 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 rounded-full border-4 border-white bg-emerald-500 p-2">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900">
          Congratulations!
        </h1>
        <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-slate-500">
          You&apos;ve mastered the curriculum and completed all requirements for
          this course.
        </p>

        <div className="mb-10 flex items-center gap-5 rounded-3xl border border-slate-100 bg-slate-50 p-6 text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Star className="fill-amber-400 text-amber-400" size={24} />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Earned Certificate
            </p>
            <h2 className="text-lg font-bold leading-tight text-slate-900">
              {course.title}
            </h2>
          </div>
        </div>

        {progress && !isProgressError && (
          <div className="mb-10 px-4">
            <div className="mb-3 flex justify-between text-xs font-black uppercase tracking-tighter text-slate-400">
              <span>Final Completion Status</span>
              <span className="text-emerald-600">100% Verified</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-1">
              <div
                className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm transition-all duration-1000 ease-out"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => setIsReviewOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
          >
            <Star size={18} />
            Rate Course
          </button>

          <button
            onClick={() => router.push("/courses")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 py-4 font-bold text-white shadow-xl shadow-teal-100 transition-all hover:bg-teal-700 active:scale-95"
          >
            Explore More
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 border-t border-slate-100 pt-8">
          <button className="flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-teal-600">
            <Download size={16} /> Certificate
          </button>
          <button className="flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-teal-600">
            <Share2 size={16} /> Share Result
          </button>
        </div>
      </div>

      <ReviewModal
        courseId={courseId}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />

      {/* Decorative Elements */}
      <div aria-hidden="true" className="absolute left-[-5%] top-[-10%] h-64 w-64 rounded-full bg-teal-50 opacity-60 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-emerald-50 opacity-60 blur-3xl" />
    </div>
  );
}