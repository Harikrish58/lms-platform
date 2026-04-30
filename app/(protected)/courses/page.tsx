"use client";

import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/services/course.service";
import { motion } from "framer-motion";
import { Star, Users, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Types
type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  averageRating: number;
  totalReviews: number;
  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  _count: {
    enrollments: number;
    sections: number;
  };
};

type CoursesResponse = {
  success: boolean;
  data: Course[];
  meta: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
};

export default function CoursesPage() {
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery<CoursesResponse>({
    queryKey: ["courses", { page: 1, limit: 12 }],
    queryFn: () => getCourses({ page: 1, limit: 12 }),
  });

  const courses = data?.data || [];

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-6 py-12 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-violet-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">
          Curating the best courses for you...
        </p>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-50/50">
          <p className="text-red-500 font-bold text-lg">
            Failed to load courses
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-sm font-bold text-violet-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-50/50 blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-violet-50/50 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Explore Courses
          </motion.h1>
          <p className="text-slate-500 mt-2 font-medium">
            Unlock your potential with expert-led masterclasses.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => router.push(`/courses/${course.id}`)}
              role="button"
              className="cursor-pointer group bg-white rounded-[2rem] p-2 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-video w-full bg-slate-100 rounded-[1.5rem] mb-4 overflow-hidden relative">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 uppercase tracking-widest text-[10px] font-bold">
                    No Preview
                  </div>
                )}

                {/* Sections Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-violet-600 shadow-sm flex items-center gap-1">
                  <BookOpen size={10} />
                  {course._count.sections} Sections
                </div>
              </div>

              {/* Info */}
              <div className="px-4 pb-5 flex flex-col flex-grow">
                <h2 className="font-bold text-slate-900 leading-tight line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors">
                  {course.title}
                </h2>

                <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                  {course.instructor?.name}
                </p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  {/* Price */}
                  <div>
                    <span className="text-xl font-black text-slate-900">
                      {course.price === 0
                        ? "Free"
                        : `$${course.price.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Rating + Students */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-bold">
                        {course.averageRating
                          ? course.averageRating.toFixed(1)
                          : "New"}
                      </span>
                      <span className="text-slate-400 font-medium text-[10px]">
                        ({course.totalReviews})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                      <Users size={10} />
                      <span>{course._count.enrollments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty */}
        {courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-20 text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200"
          >
            <div className="text-slate-300 mb-4 flex justify-center">
              <BookOpen size={48} />
            </div>
            <p className="text-slate-500 font-bold text-lg">No courses found</p>
            <p className="text-slate-400 text-sm">
              Check back later for new content!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
