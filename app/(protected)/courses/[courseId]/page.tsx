"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  Award,
  Users,
  Star,
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { createCheckoutSession } from "@/services/payment.service";
import { getCourseById } from "@/services/course.service";

// Interface definitions aligned with Prisma backend schema
interface Lesson {
  id: string;
  title: string;
  videoUrl?: string | null;
  pdfUrl?: string | null;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseWithContent {
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
  };
  sections: Section[];
}

interface CourseResponse {
  success: boolean;
  data: CourseWithContent;
}

// Professional Course Detail Page with synchronized backend data and dynamic UI states
export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Fetch course data using TanStack Query for high-performance caching
  const { data, isLoading, isError } = useQuery<CourseResponse>({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 10,
  });

  // Derived state for curriculum metrics and asset availability
  const stats = useMemo(() => {
    if (!data?.data)
      return { totalLessons: 0, totalSections: 0, hasResources: false };

    let lessonCount = 0;
    let resourceExists = false;

    data.data.sections.forEach((s) => {
      lessonCount += s.lessons.length;
      if (s.lessons.some((l) => l.pdfUrl)) resourceExists = true;
    });

    return {
      totalLessons: lessonCount,
      totalSections: data.data.sections.length,
      hasResources: resourceExists,
    };
  }, [data]);

  // Expand curriculum sections by default for better content visibility
  useEffect(() => {
    if (data?.data) {
      const initialState: Record<string, boolean> = {};
      data.data.sections.forEach((s) => (initialState[s.id] = true));
      setOpenSections(initialState);
    }
  }, [data]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Secure payment and enrollment orchestration
  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      const res = await createCheckoutSession(courseId);

      if (!res.success) {
        if (res.message === "Already enrolled") {
          toast.success("Redirecting to your classroom...");
          router.push(`/learn/${courseId}`);
          return;
        }
        toast.error(res.message || "Failed to start enrollment");
        return;
      }

      if (res.data?.free) {
        toast.success("Enrolled successfully!");
        router.push("/my-courses");
        return;
      }

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message
          : "Connection error";
      toast.error(message);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) return <SkeletonLoader />;
  if (isError || !data?.data) return <ErrorState />;

  const course = data.data;

  return (
    <div className="min-h-screen bg-white">
      {/* Dark Theme Hero Banner */}
      <div className="bg-[#1c1d1f] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <nav className="flex gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-4">
              <span>Courses</span> &gt; <span>Development</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 line-clamp-3">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="font-black text-xl">
                  {course.averageRating.toFixed(1)}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={
                        i < Math.floor(course.averageRating)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>
              </div>
              <span className="text-indigo-300 underline font-medium">
                ({course.totalReviews.toLocaleString()} ratings)
              </span>
              <span className="text-gray-300 font-medium">
                {course._count.enrollments.toLocaleString()} students
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                {course.instructor.name.charAt(0)}
              </div>
              <span>
                Created by{" "}
                <span className="text-indigo-300 underline font-bold">
                  {course.instructor.name}
                </span>
              </span>
              <span className="flex items-center gap-1 ml-4">
                <Globe size={14} /> English [Auto]
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Detailed Course breakdown and Curriculum */}
          <div className="lg:col-span-2 space-y-12">
            <section className="p-8 border-2 border-slate-100 rounded-xl bg-slate-50/30">
              <h2 className="text-2xl font-black mb-6">
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Master core principles",
                  "Real-world project builds",
                  "Best industry practices",
                  "Advanced optimization",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-700 font-medium"
                  >
                    <CheckCircle2
                      className="text-slate-400 shrink-0"
                      size={18}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">Course content</h2>
              <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-4">
                <div>
                  {stats.totalSections} sections • {stats.totalLessons} lectures
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.values(openSections).every((v) => v);
                    const newState: Record<string, boolean> = {};
                    course.sections.forEach((s) => (newState[s.id] = !allOpen));
                    setOpenSections(newState);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {Object.values(openSections).every((v) => v)
                    ? "Collapse all"
                    : "Expand all"}
                </button>
              </div>

              {/* Recursive curriculum rendering */}
              <div className="border border-slate-200 rounded-lg shadow-sm">
                {course.sections.map((section) => (
                  <div key={section.id} className="border-b last:border-none">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/50 hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {openSections[section.id] ? (
                          <ChevronUp size={20} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={20} className="text-slate-400" />
                        )}
                        <span className="font-black text-slate-800">
                          {section.title}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {section.lessons.length} lectures
                      </span>
                    </button>

                    {openSections[section.id] && (
                      <div className="bg-white">
                        {section.lessons.map((lesson, idx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-8 py-3 hover:bg-slate-50 text-sm group cursor-default"
                          >
                            <div className="flex items-center gap-4">
                              <PlayCircle
                                size={16}
                                className="text-slate-300 group-hover:text-indigo-600"
                              />
                              <span className="text-slate-600 font-medium">
                                {lesson.title}
                              </span>
                            </div>
                            {idx === 0 && section.order === 1 ? (
                              <span className="text-indigo-600 font-black underline text-xs cursor-pointer">
                                Preview
                              </span>
                            ) : (
                              <Lock size={14} className="text-slate-200" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-4">Description</h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {course.description}
              </div>
            </section>
          </div>

          {/* Persistent Sidebar Purchase Component */}
          <div className="relative">
            <div className="lg:sticky lg:top-8 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
              <div className="relative aspect-video w-full group cursor-pointer">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-700"
                  />
                ) : (
                  <div className="bg-slate-900 w-full h-full flex items-center justify-center">
                    <PlayCircle size={48} className="text-indigo-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <PlayCircle size={64} className="text-white" />
                  <span className="text-white font-black mt-3 uppercase tracking-widest text-xs">
                    Preview
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-4xl font-black text-slate-900">
                    {course.price === 0
                      ? "Free"
                      : `$${course.price.toFixed(2)}`}
                  </span>
                  {course.price > 0 && (
                    <span className="text-slate-400 line-through font-bold text-lg">
                      ${(course.price * 1.8).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 active:scale-[0.97]"
                  >
                    {isEnrolling ? "Processing..." : "Buy now"}
                  </button>
                  <button className="w-full border-2 border-slate-900 font-black py-4 rounded-xl hover:bg-slate-50 transition-all">
                    Add to cart
                  </button>
                </div>

                <div className="mt-10 border-t pt-8">
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6">
                    Course features:
                  </h3>
                  <ul className="space-y-4 text-sm text-slate-700 font-bold">
                    <li className="flex items-center gap-4">
                      <Clock size={18} className="text-slate-400" /> Lifetime
                      access
                    </li>
                    <li className="flex items-center gap-4">
                      <Users size={18} className="text-slate-400" /> Community
                      support
                    </li>
                    {stats.hasResources && (
                      <li className="flex items-center gap-4">
                        <FileText size={18} className="text-indigo-500" />{" "}
                        Downloadable PDF resources
                      </li>
                    )}
                    <li className="flex items-center gap-4">
                      <Award size={18} className="text-slate-400" /> Certificate
                      of completion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual feedback components for data loading and errors
function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-12">
      <div className="h-96 bg-slate-900" />
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-12">
        <div className="col-span-2 space-y-6">
          <div className="h-20 bg-slate-100 rounded-xl w-full" />
          <div className="h-40 bg-slate-100 rounded-xl w-full" />
        </div>
        <div className="h-125 bg-slate-100 rounded-2xl w-full" />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <ShieldCheck size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4">
        Catalog unavailable
      </h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
        We encountered a secure server error. Please verify the URL or try again
        later.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black shadow-xl"
      >
        Retry Connection
      </button>
    </div>
  );
}
