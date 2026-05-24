"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  Edit2, 
  LayoutDashboard, 
  Eye, 
  EyeOff, 
  Loader2 
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

export default function InstructorCoursesPage() {
  const router = useRouter();

  const { data: courses = [], isLoading, isError } = useQuery<InstructorCourse[]>({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/instructor/courses");
      return response.data.data;
    },
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-slate-600 font-bold mb-4">Failed to load courses.</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-indigo-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600" />
            Instructor Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage your courses, curriculum, and enrollments.
          </p>
        </div>

        <button
          onClick={() => router.push("/instructor/courses/create")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={20} />
          New Course
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h2>
          <p className="text-slate-500 mb-6">Start building your first curriculum today.</p>
          <button
            onClick={() => router.push("/instructor/courses/create")}
            className="text-indigo-600 font-bold hover:underline"
          >
            Create your first course
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{course.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Created {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        course.isPublished 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {course.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      ${course.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {course.enrollmentsCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/instructor/courses/${course.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-sm rounded-lg transition-colors"
                      >
                        <Edit2 size={14} /> Edit
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