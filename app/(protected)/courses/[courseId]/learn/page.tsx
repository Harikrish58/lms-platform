"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseById } from "@/services/course.service";
import axios from "@/lib/axios";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  ArrowLeft,
  Loader2,
  Menu,
  X,
} from "lucide-react";

/**
 * TYPES & INTERFACES
 */
type Lesson = { id: string; title: string };
type Section = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; sections: Section[] };
type LessonDetail = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  resources?: string | null;
};

interface CourseResponse {
  data: Course;
}

interface LessonResponse {
  data: LessonDetail;
}

interface ProgressResponse {
  data: {
    completedLessonIds: string[];
    progressPercentage: number;
  };
}

export default function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const lessonId = searchParams.get("lessonId");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // FETCH COURSE STRUCTURE
  const { 
    data: courseData, 
    isLoading: courseLoading,
    isError: isCourseError
  } = useQuery<CourseResponse>({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  const course = courseData?.data;

  // FLATTEN LESSONS FOR NAVIGATION
  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.sections.flatMap((s) => s.lessons);
  }, [course]);

  const activeLessonId = lessonId || allLessons[0]?.id;
  const currentIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  // FETCH ACTIVE LESSON DETAILS
  const { 
    data: lessonData, 
    isLoading: lessonLoading,
    isError: isLessonError
  } = useQuery<LessonResponse>({
    queryKey: ["lesson", activeLessonId],
    queryFn: async () => {
      const res = await axios.get(`/api/lesson/${activeLessonId}`);
      return res.data;
    },
    enabled: !!activeLessonId,
  });

  const lesson = lessonData?.data;

  // FETCH & MANAGE PROGRESS
  const { data: progressData } = useQuery<ProgressResponse>({
    queryKey: ["progress", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/courses/${courseId}/progress`);
      return res.data;
    },
  });

  const progress = progressData?.data;
  const completedIds = useMemo(
    () => progress?.completedLessonIds || [],
    [progress],
  );

  const isCurrentLessonCompleted = Boolean(activeLessonId && completedIds.includes(activeLessonId));

  // MUTATION: MARK LESSON AS COMPLETE
  const { mutate: markComplete, isPending: isMarkingComplete } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/lesson/${activeLessonId}/progress`);
    },
    onSuccess: () => {
      // Invalidate queries to refresh progress percentage and checkmarks
      queryClient.invalidateQueries({ queryKey: ["progress", courseId] });
    },
  });

  const handleMarkComplete = () => {
    if (!isMarkingComplete && !isCurrentLessonCompleted) {
      markComplete();
    }
  };

  // AUTO-RESUME LOGIC
  useEffect(() => {
    if (!course || !progress || lessonId || allLessons.length === 0) return;

    const lastCompletedIndex = allLessons.findLastIndex((l) =>
      completedIds.includes(l.id),
    );
    const resumeIndex =
      lastCompletedIndex === -1
        ? 0
        : Math.min(lastCompletedIndex + 1, allLessons.length - 1);

    const target = allLessons[resumeIndex]?.id;
    if (target) {
      router.replace(`/courses/${courseId}/learn?lessonId=${target}`);
    }
  }, [course, progress, lessonId, allLessons, completedIds, courseId, router]);

  // FULL PAGE LOADING STATE
  if (courseLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="font-medium text-slate-500">Initializing classroom...</p>
      </div>
    );
  }

  // FULL PAGE ERROR STATE
  if (isCourseError || !course) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <p className="text-lg font-bold text-rose-600">Failed to load course structure.</p>
        <button
          onClick={() => router.push("/courses")}
          className="font-bold text-teal-600 transition-colors hover:text-teal-700"
        >
          Return to courses
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* MOBILE OVERLAY */}
      {!isSidebarOpen && (
        <button
          aria-label="Open course navigation"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-teal-600 p-4 text-white shadow-xl lg:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      {/* SIDEBAR: COURSE CONTENT */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-80 transform border-r bg-white shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="border-b bg-slate-50/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <Link
                href={`/courses/${courseId}`}
                className="text-slate-400 transition-colors hover:text-slate-900"
              >
                <ArrowLeft size={20} />
              </Link>
              <button
                aria-label="Close course navigation"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded p-1 hover:bg-slate-200 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>
            <h2 className="mb-4 font-black leading-tight text-slate-900">
              {course.title}
            </h2>

            {/* Progress Bar */}
            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Course Progress</span>
                  <span className="text-teal-600">
                    {progress.progressPercentage}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-teal-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-4 space-y-6">
            {course.sections.map((section, sIdx) => (
              <div key={section.id}>
                <h3 className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Section {sIdx + 1}: {section.title}
                </h3>

                <div className="space-y-1">
                  {section.lessons.map((l) => {
                    const isActive = l.id === activeLessonId;
                    const isCompleted = completedIds.includes(l.id);

                    return (
                      <Link
                        key={l.id}
                        href={`/courses/${courseId}/learn?lessonId=${l.id}`}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-500"
                            />
                          ) : isActive ? (
                            <PlayCircle
                              size={18}
                              className="animate-pulse text-teal-600"
                            />
                          ) : (
                            <div className="h-[18px] w-[18px] rounded-full border-2 border-slate-200" />
                          )}
                        </div>
                        <span className="truncate">{l.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="z-30 flex h-16 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                aria-label="Open course navigation"
                onClick={() => setIsSidebarOpen(true)}
                className="hidden rounded-lg p-2 hover:bg-slate-100 lg:block"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="max-w-md truncate font-bold text-slate-800">
              {lessonLoading ? "Loading lesson..." : lesson?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isMarkingComplete}
              onClick={handleMarkComplete}
              className={`hidden items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition-all sm:flex ${
                isCurrentLessonCompleted
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-600 hover:text-teal-600"
              }`}
            >
              {isCurrentLessonCompleted ? "Completed" : "Mark as complete"}
            </button>
          </div>
        </header>

        {/* LEARNING CONTENT AREA */}
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-8">
            {/* VIDEO PLAYER CONTAINER */}
            <div className="group relative aspect-video overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
              {isLessonError ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-bold text-rose-500">Failed to load video content.</p>
                </div>
              ) : lessonLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                </div>
              ) : lesson?.videoUrl ? (
                <video
                  key={lesson.videoUrl} // Reset player on source change
                  src={lesson.videoUrl}
                  controls
                  aria-label={lesson.title || "Lesson video"}
                  onEnded={handleMarkComplete}
                  className="h-full w-full object-contain"
                  controlsList="nodownload"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
                  <PlayCircle size={64} className="opacity-20" />
                  <p className="font-bold">No video content for this lesson</p>
                </div>
              )}
            </div>

            {/* LESSON DETAILS */}
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
                    <CheckCircle2 size={24} className="text-teal-600" />
                    About this lesson
                  </h2>
                  <p className="leading-relaxed text-slate-600">
                    {lesson?.description ||
                      "No description provided for this lesson."}
                  </p>
                </div>
              </div>

              {/* RESOURCES PANEL */}
              <div className="space-y-6">
                {lesson?.resources && (
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
                      <FileText size={18} className="text-teal-600" />
                      Resources
                    </h2>
                    <div className="prose prose-slate text-sm text-slate-600">
                      {lesson.resources}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER NAVIGATION */}
            <footer className="mt-12 flex items-center justify-between border-t border-slate-200 py-8">
              {prevLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lessonId=${prevLesson.id}`}
                  className="group flex items-center gap-2 font-bold text-slate-500 transition-all hover:text-teal-600"
                >
                  <div className="rounded-full p-2 transition-colors group-hover:bg-teal-50">
                    <ChevronLeft size={24} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] uppercase tracking-tighter opacity-60">
                      Back
                    </span>
                    <span className="hidden text-sm md:block">
                      {prevLesson.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <button
                  onClick={() => {
                    handleMarkComplete();
                    router.push(
                      `/courses/${courseId}/learn?lessonId=${nextLesson.id}`,
                    );
                  }}
                  className="group flex items-center gap-2 rounded-2xl bg-teal-600 py-2 pl-6 pr-2 font-bold text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-tighter text-teal-100 opacity-80">
                      Next Lesson
                    </span>
                    <span className="hidden text-sm md:block">
                      {nextLesson.title}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/20 p-2">
                    <ChevronRight size={24} />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleMarkComplete();
                    router.push(`/courses/${courseId}/completed`);
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 font-black text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700"
                >
                  Complete Course
                  <CheckCircle2 size={20} />
                </button>
              )}
            </footer>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}