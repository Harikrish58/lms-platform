"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  PlusCircle,
  Edit2,
  LayoutDashboard,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import axiosInstance from "@/lib/axios";

interface InstructorCourse {
  id: string;
  title: string;
  price: number;
  isPublished: boolean;
  enrollmentsCount: number;
  createdAt: string;
}

/**
 * Instructor course management dashboard.
 * Displays all instructor-owned courses with quick access
 * to editing, publication status, and enrollment metrics.
 */
export default function InstructorCoursesPage() {
  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<InstructorCourse[]>({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/instructor/courses");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div
        className="flex h-[80vh] items-center justify-center"
        aria-label="Loading courses"
      >
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h2 className="text-lg font-bold text-slate-900">
          Unable to load courses
        </h2>

        <p className="mt-2 text-slate-500">
          Something went wrong while fetching your courses.
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 font-semibold text-teal-600 transition-colors hover:text-teal-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900">
            <LayoutDashboard className="text-teal-600" />
            Courses
          </h1>

          <p className="mt-2 font-medium text-slate-500">
            Manage your courses, curriculum, and enrollments.
          </p>
        </div>

        <Link
          href="/instructor/courses/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-bold text-white transition-colors hover:bg-teal-700"
        >
          <PlusCircle size={20} />
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
          <h2 className="mb-2 text-xl font-bold text-slate-900">
            No courses yet
          </h2>

          <p className="mb-6 text-slate-500">
            Start building your first curriculum today.
          </p>

          <Link
            href="/instructor/courses/create"
            className="font-bold text-teal-600 transition-colors hover:text-teal-700"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Course
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Price
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Students
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">
                        {course.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Created{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          course.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {course.isPublished ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}

                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      ${course.price.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {course.enrollmentsCount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/instructor/courses/${course.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-700 transition-colors hover:bg-teal-100"
                      >
                        <Edit2 size={14} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}