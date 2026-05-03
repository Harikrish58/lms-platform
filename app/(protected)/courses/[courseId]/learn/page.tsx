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
 * Defines the core structure for the learning experience
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
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  const course: Course | undefined = courseData?.data;

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
  const { data: lessonData, isLoading: lessonLoading } = useQuery({
    queryKey: ["lesson", activeLessonId],
    queryFn: async () => {
      const res = await axios.get(`/api/lesson/${activeLessonId}`);
      return res.data;
    },
    enabled: !!activeLessonId,
  });

  const lesson: LessonDetail | undefined = lessonData?.data;

  // FETCH & MANAGE PROGRESS
  const { data: progressData } = useQuery({
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

  if (courseLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Initializing classroom...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fcfcfd] overflow-hidden">
      {/* MOBILE OVERLAY */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-xl"
        >
          <Menu size={24} />
        </button>
      )}

      {/* SIDEBAR: COURSE CONTENT */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/courses/${courseId}`}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-200 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <h2 className="font-black text-slate-900 leading-tight mb-4">
              {course?.title}
            </h2>

            {/* Progress Bar */}
            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Course Progress</span>
                  <span className="text-indigo-600">
                    {progress.progressPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {course?.sections.map((section, sIdx) => (
              <div key={section.id}>
                <h3 className="text-[10px] uppercase text-slate-400 font-black tracking-widest mb-3 px-2">
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
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
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
                              className="text-indigo-600 animate-pulse"
                            />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200" />
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
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 px-8 bg-white/80 backdrop-blur-md border-b flex justify-between items-center z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden lg:block p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="font-bold text-slate-800 truncate max-w-md">
              {lessonLoading ? "Loading lesson..." : lesson?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isMarkingComplete}
              onClick={() => markComplete()}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                completedIds.includes(activeLessonId as string)
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-white border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600"
              }`}
            >
              {completedIds.includes(activeLessonId as string)
                ? "Completed"
                : "Mark as complete"}
            </button>
          </div>
        </header>

        {/* LEARNING CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto p-8">
            {/* VIDEO PLAYER CONTAINER */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-900 group">
              {lessonLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                </div>
              ) : lesson?.videoUrl ? (
                <video
                  key={lesson.videoUrl} // Reset player on source change
                  src={lesson.videoUrl}
                  controls
                  onEnded={() => markComplete()}
                  className="w-full h-full object-contain"
                  controlsList="nodownload"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <PlayCircle size={64} className="opacity-20" />
                  <p className="font-bold">No video content for this lesson</p>
                </div>
              )}
            </div>

            {/* LESSON DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                  <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-indigo-600" />
                    About this lesson
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {lesson?.description ||
                      "No description provided for this lesson."}
                  </p>
                </div>
              </div>

              {/* RESOURCES PANEL */}
              <div className="space-y-6">
                {lesson?.resources && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                      <FileText size={18} className="text-indigo-600" />
                      Resources
                    </h2>
                    <div className="text-slate-600 text-sm prose prose-slate">
                      {lesson.resources}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER NAVIGATION */}
            <footer className="flex justify-between items-center mt-12 py-8 border-t border-slate-200">
              {prevLesson ? (
                <Link
                  href={`/courses/${courseId}/learn?lessonId=${prevLesson.id}`}
                  className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all"
                >
                  <div className="p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                    <ChevronLeft size={24} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] uppercase tracking-tighter opacity-60">
                      Back
                    </span>
                    <span className="text-sm hidden md:block">
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
                    markComplete();
                    router.push(
                      `/courses/${courseId}/learn?lessonId=${nextLesson.id}`,
                    );
                  }}
                  className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white pl-6 pr-2 py-2 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-tighter opacity-80 text-indigo-100">
                      Next Lesson
                    </span>
                    <span className="text-sm hidden md:block">
                      {nextLesson.title}
                    </span>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ChevronRight size={24} />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    markComplete();
                    router.push(`/courses/${courseId}/completed`);
                  }}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700"
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
