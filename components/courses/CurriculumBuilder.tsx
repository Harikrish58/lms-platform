"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  PlusCircle,
  Trash2,
  GripVertical,
  Video,
  Loader2,
  Layout,
  X,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

interface Lesson {
  id: string;
  title: string;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CurriculumBuilderProps {
  courseId: string;
  initialSections?: Section[];
}

export default function CurriculumBuilder({
  courseId,
  initialSections = [],
}: CurriculumBuilderProps) {
  const queryClient = useQueryClient();
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const createSectionMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await axiosInstance.post(
        `/api/courses/${courseId}/sections`,
        { title },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Section created");
      setNewSectionTitle("");
      setIsCreatingSection(false);
      queryClient.invalidateQueries({
        queryKey: ["instructor-course", courseId],
      });
    },
    onError: () => {
      toast.error("Failed to create section");
    },
  });

  const onSubmitSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionTitle.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    createSectionMutation.mutate(newSectionTitle.trim());
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          <Layout size={20} className="text-indigo-600" />
          <h2 className="text-lg font-bold">Curriculum</h2>
        </div>

        {!isCreatingSection && (
          <button
            onClick={() => setIsCreatingSection(true)}
            className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <PlusCircle size={16} />
            Add Section
          </button>
        )}
      </div>

      {isCreatingSection && (
        <form
          onSubmit={onSubmitSection}
          className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200"
        >
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            New Section Title
          </label>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Module 1: Getting Started"
              disabled={createSectionMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setIsCreatingSection(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <button
              type="submit"
              disabled={createSectionMutation.isPending}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {createSectionMutation.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Save
            </button>
          </div>
        </form>
      )}

      {initialSections.length === 0 && !isCreatingSection && (
        <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm font-medium text-slate-500 mb-3">
            No sections added yet
          </p>
          <button
            onClick={() => setIsCreatingSection(true)}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            Create your first section
          </button>
        </div>
      )}

      <div className="space-y-4">
        {initialSections.map((section) => (
          <SectionItem key={section.id} section={section} courseId={courseId} />
        ))}
      </div>
    </div>
  );
}

interface SectionItemProps {
  section: Section;
  courseId: string;
}

function SectionItem({ section, courseId }: SectionItemProps) {
  const queryClient = useQueryClient();
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const deleteSectionMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(
        `/api/courses/${courseId}/sections/${section.id}`,
      );
    },
    onSuccess: () => {
      toast.success("Section deleted");
      queryClient.invalidateQueries({
        queryKey: ["instructor-course", courseId],
      });
    },
    onError: () => {
      toast.error("Failed to delete section");
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await axiosInstance.post(
        `/api/courses/${courseId}/sections/${section.id}/lessons`,
        { title },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lesson added");
      setNewLessonTitle("");
      setIsCreatingLesson(false);
      queryClient.invalidateQueries({
        queryKey: ["instructor-course", courseId],
      });
    },
    onError: () => {
      toast.error("Failed to create lesson");
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      await axiosInstance.delete(
        `/api/courses/${courseId}/sections/${section.id}/lessons/${lessonId}`,
      );
    },
    onSuccess: () => {
      toast.success("Lesson deleted");
      queryClient.invalidateQueries({
        queryKey: ["instructor-course", courseId],
      });
    },
    onError: () => {
      toast.error("Failed to delete lesson");
    },
  });

  const onAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLessonTitle.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    createLessonMutation.mutate(newLessonTitle.trim());
  };

  const confirmDeleteSection = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this section? All lessons inside will be lost.",
      )
    ) {
      deleteSectionMutation.mutate();
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-slate-100/50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="cursor-grab hover:text-indigo-600 text-slate-400 transition-colors">
            <GripVertical size={18} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">{section.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingLesson(true)}
            className="text-xs font-bold text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
          >
            + Add Lesson
          </button>
          <button
            onClick={confirmDeleteSection}
            disabled={deleteSectionMutation.isPending}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          >
            {deleteSectionMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="p-2 space-y-2">
        {section.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group"
          >
            <div className="flex items-center gap-3">
              <div className="cursor-grab hover:text-indigo-600 text-slate-300 transition-colors">
                <GripVertical size={16} />
              </div>
              <Video size={16} className="text-indigo-400" />
              <span className="text-sm font-medium text-slate-700">
                {lesson.title}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/instructor/courses/${courseId}/lessons/${lesson.id}`}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors block"
                title="Edit lesson details"
              >
                <Pencil size={14} />
              </Link>
              <button
                onClick={() => deleteLessonMutation.mutate(lesson.id)}
                disabled={deleteLessonMutation.isPending}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {section.lessons.length === 0 && !isCreatingLesson && (
          <div className="text-center py-4 text-xs font-medium text-slate-500 italic">
            No lessons in this section
          </div>
        )}

        {isCreatingLesson && (
          <form
            onSubmit={onAddLesson}
            className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100"
          >
            <input
              autoFocus
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm outline-none focus:border-indigo-400"
              placeholder="Lesson title..."
              disabled={createLessonMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setIsCreatingLesson(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
            <button
              type="submit"
              disabled={createLessonMutation.isPending}
              className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {createLessonMutation.isPending && (
                <Loader2 size={12} className="animate-spin" />
              )}
              Save
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
