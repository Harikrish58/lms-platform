"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GripVertical, PlayCircle } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

interface LessonData {
  id: string;
  title: string;
  order: number;
}

interface SectionData {
  id: string;
  title: string;
  order: number;
  lessons: LessonData[];
}

interface CourseData {
  id: string;
  sections: SectionData[];
}

interface CurriculumBuilderProps {
  courseId: string;
  initialData: CourseData;
}

export default function CurriculumBuilder({
  courseId,
  initialData,
}: CurriculumBuilderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const [creatingLessonForSection, setCreatingLessonForSection] = useState<
    string | null
  >(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState<File | null>(null);

  const sections = initialData.sections || [];

  const createSectionMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await axiosInstance.post("/api/sections", {
        courseId,
        title,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Section created");
      setNewSectionTitle("");
      setIsCreatingSection(false);
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => toast.error("Failed to create section"),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      await axiosInstance.delete(`/api/sections/${sectionId}`);
    },
    onSuccess: () => {
      toast.success("Section deleted");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => toast.error("Failed to delete section"),
  });

  const createLessonMutation = useMutation({
    mutationFn: async ({
      sectionId,
      title,
      video,
    }: {
      sectionId: string;
      title: string;
      video: File;
    }) => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("video", video);

      const response = await axiosInstance.post(
        `/api/lesson?sectionId=${sectionId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lesson and video uploaded successfully");
      setNewLessonTitle("");
      setNewLessonVideo(null);
      setCreatingLessonForSection(null);
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to upload lesson video",
      );
    },
  });

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      createSectionMutation.mutate(newSectionTitle.trim());
    }
  };

  const handleCreateLesson = (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    if (newLessonTitle.trim() && newLessonVideo) {
      createLessonMutation.mutate({
        sectionId,
        title: newLessonTitle.trim(),
        video: newLessonVideo,
      });
    } else {
      toast.error("Both a title and a video file are required");
    }
  };

  return (
    <div className="space-y-6">
      {sections.length === 0 && !isCreatingSection && (
        <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-slate-500 font-medium text-sm">
            No sections yet. Start building your curriculum.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <GripVertical
                  className="text-slate-400 cursor-grab active:cursor-grabbing"
                  size={18}
                />
                <h3 className="font-semibold text-slate-800 text-sm">
                  {section.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteSectionMutation.mutate(section.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 bg-white">
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 border border-slate-100 rounded hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <PlayCircle className="text-slate-400" size={16} />
                    <span className="text-sm font-medium text-slate-700">
                      {lesson.title}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/instructor/courses/${courseId}/${lesson.id}`,
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
              ))}

              {creatingLessonForSection === section.id ? (
                <form
                  onSubmit={(e) => handleCreateLesson(e, section.id)}
                  className="mt-3 p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Lesson Title
                    </label>
                    <input
                      autoFocus
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="e.g. Introduction to Variables"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Lesson Video (Required)
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setNewLessonVideo(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCreatingLessonForSection(null);
                        setNewLessonVideo(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        createLessonMutation.isPending ||
                        !newLessonTitle.trim() ||
                        !newLessonVideo
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-slate-900 border border-transparent rounded shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 min-w-[100px]"
                    >
                      {createLessonMutation.isPending
                        ? "Uploading..."
                        : "Save Lesson"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setCreatingLessonForSection(section.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 mt-2 px-1"
                >
                  <Plus size={16} /> Add Lesson
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isCreatingSection ? (
        <form
          onSubmit={handleCreateSection}
          className="bg-white p-4 rounded-lg border border-slate-200"
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            New Section Title
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              autoFocus
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="e.g. Week 1: The Basics"
              className="w-full sm:flex-1 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsCreatingSection(false)}
                className="flex-1 sm:flex-none px-4 py-2 text-slate-700 hover:bg-slate-50 bg-white border border-slate-300 text-sm font-medium rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createSectionMutation.isPending || !newSectionTitle.trim()
                }
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 disabled:opacity-50 min-w-[120px]"
              >
                {createSectionMutation.isPending ? "Saving..." : "Save Section"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={() => setIsCreatingSection(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded hover:bg-slate-50 transition-all"
          >
            <Plus size={16} /> Add New Section
          </button>
        </div>
      )}
    </div>
  );
}
