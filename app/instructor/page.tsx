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
  BookOpen,
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

  const { data: analytics, isLoading: isLoadingAnalytics } =
    useQuery<AnalyticsMetrics>({
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
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Overview
          </h1>

          <p className="mt-2 font-medium text-slate-500">
            Here is what is happening with your courses today.
          </p>
        </div>

        <button
          onClick={() => router.push("/instructor/courses/create")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          <PlusCircle size={18} />
          Create Course
        </button>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-emerald-100 p-4 text-emerald-600">
            <DollarSign size={24} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500">
              Total Revenue
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              $
              {analytics?.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-teal-100 p-4 text-teal-600">
            <Users size={24} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500">
              Active Students
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {analytics?.totalEnrollments.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-amber-100 p-4 text-amber-500">
            <Star size={24} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500">
              Average Rating
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {analytics?.averageCourseRating
                ? analytics.averageCourseRating.toFixed(1)
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <BookOpen size={20} className="text-teal-600" />
            Recent Courses
          </h2>

          <Link
            href="/instructor/courses"
            className="flex items-center gap-1 text-sm font-bold text-teal-600 transition-colors hover:text-teal-700"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-slate-500">
              You haven&apos;t created any courses yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-bold text-slate-900">
                    {course.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-500">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                        course.isPublished
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>

                    <span>•</span>
                    <span>${course.price.toFixed(2)}</span>

                    <span>•</span>
                    <span>{course.enrollmentsCount} enrollments</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(`/instructor/courses/${course.id}/edit`)
                  }
                  className="shrink-0 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
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