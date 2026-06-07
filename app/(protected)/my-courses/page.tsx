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

  const { data, isLoading, isError, error, refetch } = useQuery<MyCoursesResponse>({
    queryKey: ["my-courses"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/me/courses");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const enrollments = data?.data || [];

  if (isError) {
    if (error) console.error("Failed to load enrolled courses:", error);
    
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
        <div className="mb-4 rounded-full bg-rose-50 p-4 text-rose-600">
          <BookOpen size={32} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          Unable to load courses
        </h2>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-teal-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-teal-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            My Learning
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-500">
            Pick up exactly where you left off.
          </p>
        </div>

        {/* Loading States */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && enrollments.length === 0 && (
          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-slate-900">
              You haven&apos;t enrolled in any courses yet
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-4 font-bold text-white transition-colors hover:bg-teal-700"
            >
              Explore Catalog <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        {!isLoading && enrollments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrollments.map((course) => {
              const progressVal = Math.round(course.progressPercentage ?? 0);
              const isCompleted = progressVal >= 100;

              const navigateToCourse = () => {
                if (course.courseId) {
                  router.push(`/courses/${course.courseId}/learn`);
                }
              };

              return (
                <article
                  key={course.courseId}
                  onClick={navigateToCourse}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigateToCourse();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm outline-none transition-all hover:shadow-xl focus-visible:ring-4 focus-visible:ring-teal-600/20"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title || "Course"}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <BookOpen size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle size={32} className="text-white" />
                    </div>
                  </div>

                  <div className="flex flex-grow flex-col p-5">
                    <h3 className="mb-1 line-clamp-2 font-bold text-slate-900 transition-colors group-hover:text-teal-600">
                      {course.title || "Untitled Course"}
                    </h3>

                    <p className="mb-6 text-xs font-medium text-slate-500">
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
                        <span>{progressVal}%</span>
                      </div>
                      
                      <div 
                        role="progressbar"
                        aria-valuenow={progressVal}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                      >
                        <div
                          className={`h-full rounded-full ${
                            isCompleted ? "bg-emerald-500" : "bg-teal-600"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, progressVal))}%`,
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