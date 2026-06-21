"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  PlayCircle,
  X,
  Save,
  FileVideo,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

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

  // Section Creation State
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Section Editing State
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");

  // Lesson Creation State
  const [creatingLessonForSection, setCreatingLessonForSection] = useState<
    string | null
  >(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState<File | null>(null);

  const sections = initialData.sections || [];

  // Mutations
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

  const updateSectionMutation = useMutation({
    mutationFn: async ({
      sectionId,
      title,
    }: {
      sectionId: string;
      title: string;
    }) => {
      const response = await axiosInstance.patch(`/api/sections/${sectionId}`, {
        title,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Section updated");
      setEditingSectionId(null);
      setEditingSectionTitle("");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => toast.error("Failed to update section"),
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
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to upload lesson video",
        );
        return;
      }

      toast.error("Failed to upload lesson video");
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      await axiosInstance.delete(`/api/lesson/${lessonId}`);
    },
    onSuccess: () => {
      toast.success("Lesson deleted");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => toast.error("Failed to delete lesson"),
  });

  // Handlers
  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      createSectionMutation.mutate(newSectionTitle.trim());
    }
  };

  const handleUpdateSection = (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    if (editingSectionTitle.trim()) {
      updateSectionMutation.mutate({
        sectionId,
        title: editingSectionTitle.trim(),
      });
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
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500 font-bold text-sm">
            No sections yet. Start building your curriculum.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Section Header */}
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between group transition-colors hover:bg-slate-200/50">
              {editingSectionId === section.id ? (
                <form
                  onSubmit={(e) => handleUpdateSection(e, section.id)}
                  className="flex-1 flex items-center gap-3 mr-4"
                >
                  <input
                    autoFocus
                    value={editingSectionTitle}
                    onChange={(e) => setEditingSectionTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={
                      updateSectionMutation.isPending ||
                      !editingSectionTitle.trim()
                    }
                    className="px-3 py-1.5 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSectionId(null)}
                    className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <GripVertical
                      className="text-slate-400 cursor-grab active:cursor-grabbing"
                      size={18}
                    />
                    <h3 className="font-bold text-slate-800 text-base">
                      {section.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingSectionId(section.id);
                        setEditingSectionTitle(section.title);
                      }}
                      className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit Section Name"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this section and all its lessons?",
                          )
                        ) {
                          deleteSectionMutation.mutate(section.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Lessons List */}
            <div className="p-4 space-y-3 bg-white">
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <PlayCircle className="text-teal-600" size={18} />
                    <span className="text-sm font-bold text-slate-700">
                      {lesson.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        router.push(
                          `/instructor/courses/${courseId}/${lesson.id}`,
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-teal-600 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      <Pencil size={14} /> Edit Content
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this lesson?",
                          )
                        ) {
                          deleteLessonMutation.mutate(lesson.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Lesson"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Lesson Form */}
              {creatingLessonForSection === section.id ? (
                <form
                  onSubmit={(e) => handleCreateLesson(e, section.id)}
                  className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Lesson Title
                    </label>
                    <input
                      autoFocus
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="e.g. Introduction to Variables"
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Upload Video
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setNewLessonVideo(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-600">
                        <FileVideo size={20} />
                        <span className="text-sm font-bold">
                          {newLessonVideo
                            ? newLessonVideo.name
                            : "Click or drag video file here"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCreatingLessonForSection(null);
                        setNewLessonVideo(null);
                      }}
                      className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
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
                      className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {createLessonMutation.isPending && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {createLessonMutation.isPending
                        ? "Uploading..."
                        : "Save Lesson"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setCreatingLessonForSection(section.id)}
                  className="flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 mt-3 px-2 py-1 transition-colors"
                >
                  <Plus size={16} /> Add Lesson
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Form / Trigger */}
      {isCreatingSection ? (
        <form
          onSubmit={handleCreateSection}
          className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm"
        >
          <label className="block text-sm font-bold text-slate-700 mb-2">
            New Section Title
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              autoFocus
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="e.g. Week 1: The Basics"
              className="w-full sm:flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsCreatingSection(false)}
                className="flex-1 sm:flex-none px-6 py-2.5 text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createSectionMutation.isPending || !newSectionTitle.trim()
                }
                className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 shadow-sm min-w-[140px] transition-colors"
              >
                {createSectionMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Section
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="pt-6 border-t border-slate-200">
          <button
            onClick={() => setIsCreatingSection(true)}
            className="flex items-center justify-center w-full gap-2 px-4 py-4 bg-white border-2 border-dashed border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:border-teal-300 hover:text-teal-700 transition-all"
          >
            <Plus size={18} /> Add New Section
          </button>
        </div>
      )}
    </div>
  );
}
