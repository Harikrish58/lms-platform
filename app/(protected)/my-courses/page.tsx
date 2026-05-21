"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, PlayCircle, ArrowRight } from "lucide-react";
import axiosInstance from "@/lib/axios";

// Interface updated to exactly match the return type of getMyCourses in actions/course.actions.ts
interface EnrolledCourse {
  courseId: string;
  title: string;
  thumbnail: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

interface MyCoursesResponse {
  success: boolean;
  data: EnrolledCourse[];
}

export default function MyCoursesPage() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<MyCoursesResponse>({
    queryKey: ["my-courses"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/me/courses");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const enrollments = data?.data || [];

  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <div className="bg-rose-50 p-4 rounded-full text-rose-600 mb-4">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Unable to load courses
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            My Learning
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Pick up exactly where you left off.
          </p>
        </div>

        {/* Loading States */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-[320px] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && enrollments.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-3xl mx-auto mt-12 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              You haven&apos;t enrolled in any courses yet
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Explore Catalog <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        {!isLoading && enrollments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.map((course, index) => {
              const isCompleted = (course.progressPercentage ?? 0) >= 100;
              const key = course.courseId || `enrollment-${index}`;

              return (
                <article
                  key={key}
                  onClick={() =>
                    course.courseId &&
                    router.push(`/courses/${course.courseId}/learn`)
                  }
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title || "Course"}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle size={32} className="text-white" />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-indigo-600">
                      {course.title || "Untitled Course"}
                    </h3>

                    {/* Replaced missing instructor with lesson count data returned by backend */}
                    <p className="text-xs font-medium text-slate-500 mb-6">
                      {course.completedLessons} of {course.totalLessons} lessons
                      completed
                    </p>

                    <div className="mt-auto space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span
                          className={
                            isCompleted ? "text-emerald-600" : "text-slate-500"
                          }
                        >
                          {isCompleted ? "Completed" : "Progress"}
                        </span>
                        <span>
                          {Math.round(course.progressPercentage ?? 0)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-indigo-600"}`}
                          style={{
                            width: `${Math.min(100, Math.max(0, course.progressPercentage ?? 0))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
