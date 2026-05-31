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
  Loader2,
  FolderPlus,
  Video
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

// --- Strict Interfaces ---
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

export default function CurriculumBuilder({ courseId, initialData }: CurriculumBuilderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Local State for inline forms
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  
  const [creatingLessonForSection, setCreatingLessonForSection] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const sections = initialData.sections || [];

  // --- API Mutations ---
  const createSectionMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await axiosInstance.post("/api/sections", { courseId, title });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Section created!");
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
    mutationFn: async ({ sectionId, title }: { sectionId: string; title: string }) => {
      const response = await axiosInstance.post(`/api/sections/${sectionId}/lessons`, { title });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lesson created!");
      setNewLessonTitle("");
      setCreatingLessonForSection(null);
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: () => toast.error("Failed to create lesson"),
  });

  // --- Handlers ---
  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionTitle.trim()) {
      createSectionMutation.mutate(newSectionTitle.trim());
    }
  };

  const handleCreateLesson = (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    if (newLessonTitle.trim()) {
      createLessonMutation.mutate({ sectionId, title: newLessonTitle.trim() });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* List Existing Sections */}
      {sections.length === 0 && !isCreatingSection && (
        <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
          <FolderPlus className="mx-auto text-slate-400 mb-2" size={32} />
          <p className="text-slate-500 font-medium text-sm">No sections yet. Start building your curriculum!</p>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* Section Header */}
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <GripVertical className="text-slate-400 cursor-grab active:cursor-grabbing" size={18} />
                <h3 className="font-bold text-slate-800">{section.title}</h3>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteSectionMutation.mutate(section.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Section"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Lessons List */}
            <div className="p-4 space-y-3 bg-white">
              {section.lessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Video className="text-indigo-400" size={16} />
                    <span className="text-sm font-medium text-slate-700">{lesson.title}</span>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/instructor/courses/${courseId}/${lesson.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-md text-xs font-bold transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={12} /> Edit Content
                  </button>
                </div>
              ))}

              {/* Inline Create Lesson Form */}
              {creatingLessonForSection === section.id ? (
                <form onSubmit={(e) => handleCreateLesson(e, section.id)} className="flex items-center gap-2 mt-2">
                  <input
                    autoFocus
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="e.g. Introduction to Variables"
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
                  />
                  <button 
                    type="submit" 
                    disabled={createLessonMutation.isPending || !newLessonTitle.trim()}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg disabled:opacity-50"
                  >
                    {createLessonMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCreatingLessonForSection(null)}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setCreatingLessonForSection(section.id)}
                  className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-2 px-1"
                >
                  <Plus size={16} /> Add Lesson
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Inline Create Section Form */}
      {isCreatingSection ? (
        <form onSubmit={handleCreateSection} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Section Title</label>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="e.g. Week 1: The Basics"
              className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button 
              type="submit" 
              disabled={createSectionMutation.isPending || !newSectionTitle.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createSectionMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Section"}
            </button>
            <button 
              type="button" 
              onClick={() => setIsCreatingSection(false)}
              className="px-4 py-2.5 text-slate-500 hover:bg-slate-200 text-sm font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setIsCreatingSection(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-slate-300 text-slate-600 font-bold rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all w-full justify-center"
          >
            <Plus size={18} /> Add New Section
          </button>
        </div>
      )}
    </div>
  );
}