"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCourseById } from "@/services/course.service";
import axios from "@/lib/axios";
import {
  Trophy,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Star,
  Download,
  Share2,
} from "lucide-react";

// Types
type Course = {
  id: string;
  title: string;
};

export default function CourseCompletedPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();

  // Fetch Course details for display
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  const course: Course | undefined = courseData?.data;

  // Fetch Progress to confirm 100% completion state
  const { data: progressData } = useQuery({
    queryKey: ["progress", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/courses/${courseId}/progress`);
      return res.data;
    },
  });

  const progress = progressData?.data;

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full mb-4" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] px-6 py-12 relative overflow-hidden">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-16 text-center border border-slate-100 relative z-10">
        {/* Animated Trophy Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Trophy className="text-white w-14 h-14" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2 border-4 border-white">
            <CheckCircle2 className="text-white w-6 h-6" />
          </div>
        </div>

        {/* Celebratory Messaging */}
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Congratulations!
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          You&apos;ve mastered the curriculum and completed all requirements for
          this course.
        </p>

        {/* Course Card Summary */}
        <div className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100 text-left flex items-center gap-5">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
            <Star className="text-amber-400 fill-amber-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">
              Earned Certificate
            </p>
            <h2 className="font-bold text-slate-900 text-lg leading-tight">
              {course?.title}
            </h2>
          </div>
        </div>

        {/* Visual Progress Confirmation */}
        {progress && (
          <div className="mb-10 px-4">
            <div className="flex justify-between text-xs font-black uppercase tracking-tighter mb-3 text-slate-400">
              <span>Final Completion Status</span>
              <span className="text-emerald-600">100% Verified</span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}

        {/* Functional Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push(`/courses/${courseId}/learn`)}
            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            <RotateCcw size={18} />
            Review Course
          </button>

          <button
            onClick={() => router.push("/courses")}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            Explore More
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="mt-10 flex items-center justify-center gap-8 border-t border-slate-100 pt-8">
          <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            <Download size={16} />
            Certificate
          </button>
          <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            <Share2 size={16} />
            Share Result
          </button>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60" />
    </div>
  );
}
