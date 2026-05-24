"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  Users, 
  Star, 
  PlusCircle, 
  ArrowRight,
  Loader2,
  BookOpen
} from "lucide-react";
import axiosInstance from "@/lib/axios";

interface AnalyticsMetrics {
  totalRevenue: number;
  totalEnrollments: number;
  averageCourseRating: number;
}

interface Course {
  id: string;
  title: string;
  price: number;
  isPublished: boolean;
  enrollmentsCount: number;
  createdAt: string;
}

/**
 * Root dashboard for the instructor workspace.
 * Aggregates high-level key performance indicators and recent course activity 
 * to provide immediate context and workflow entry points upon login.
 */
export default function InstructorDashboard() {
  const router = useRouter();

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<AnalyticsMetrics>({
    queryKey: ["instructor-analytics-summary"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/instructor/analytics");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 15,
  });

  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["instructor-courses-recent"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/instructor/courses");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = isLoadingAnalytics || isLoadingCourses;
  const recentCourses = courses?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Here is what is happening with your courses today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/instructor/courses/create")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusCircle size={18} />
            Create Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-100 text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ${analytics?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-indigo-100 text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Active Students</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {analytics?.totalEnrollments.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-amber-100 text-amber-500">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Average Rating</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {analytics?.averageCourseRating ? analytics.averageCourseRating.toFixed(1) : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" />
            Recent Courses
          </h2>
          <Link 
            href="/instructor/courses"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 font-medium">You haven&apos;t created any courses yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentCourses.map((course) => (
              <div key={course.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <h3 className="font-bold text-slate-900">{course.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-500">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                      course.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                    <span>•</span>
                    <span>${course.price.toFixed(2)}</span>
                    <span>•</span>
                    <span>{course.enrollmentsCount} enrollments</span>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors shrink-0"
                >
                  Manage Course
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}