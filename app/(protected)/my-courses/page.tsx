"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  PlayCircle,
  ArrowRight,
  Search,
  CheckCircle2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";

// Interface mapping based on typical relational database returns for enrollments
interface EnrolledCourse {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    thumbnail: string | null;
    instructor: {
      name: string;
    };
  };
}

interface MyCoursesResponse {
  success: boolean;
  data: EnrolledCourse[];
}

export default function MyCoursesPage() {
  const router = useRouter();

  // Fetching the user's enrolled portfolio using your existing backend endpoint
  const { data, isLoading, isError } = useQuery<MyCoursesResponse>({
    queryKey: ["my-courses"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/me/courses");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const enrollments = data?.data || [];

  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <div className="bg-rose-50 p-4 rounded-full text-rose-600 mb-4">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Unable to load your courses
        </h2>
        <p className="text-slate-500 mb-6">
          There was a problem connecting to the server. Please try again.
        </p>
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
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            My Learning
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Pick up exactly where you left off.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-[320px]"
              >
                <div className="aspect-video bg-slate-200 rounded-xl mb-4 animate-pulse" />
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-100 rounded mb-6 animate-pulse" />
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State - No Courses Found */}
        {!isLoading && enrollments.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-3xl mx-auto mt-12 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              You haven&apos;t enrolled in any courses yet
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Browse our catalog of premium technical courses to start building
              your portfolio today.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all"
            >
              Explore Catalog
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        {!isLoading && enrollments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.map((enrollment) => {
              const isCompleted = enrollment.progress >= 100;

              return (
                <article
                  key={enrollment.id}
                  onClick={() =>
                    router.push(`/courses/${enrollment.course.id}/learn`)
                  }
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
                >
                  {/* Thumbnail Wrapper */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {enrollment.course.thumbnail ? (
                      <Image
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={32} />
                      </div>
                    )}

                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <PlayCircle size={32} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Content Payload */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mb-6">
                      {enrollment.course.instructor.name}
                    </p>

                    {/* Progress Tracking UI */}
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span
                          className={
                            isCompleted ? "text-emerald-600" : "text-slate-500"
                          }
                        >
                          {isCompleted ? "Completed" : "Overall Progress"}
                        </span>
                        <span
                          className={
                            isCompleted ? "text-emerald-600" : "text-slate-900"
                          }
                        >
                          {Math.round(enrollment.progress)}%
                        </span>
                      </div>

                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? "bg-emerald-500"
                              : "bg-gradient-to-b from-indigo-500 to-indigo-600"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, enrollment.progress))}%`,
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
