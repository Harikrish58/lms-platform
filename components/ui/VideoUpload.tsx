"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Video as VideoIcon } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

interface VideoUploadProps {
  value: string | null;
  onChange: (url: string, key?: string) => void;
  onRemove: () => void;
  endpoint?: string;
}

export default function VideoUpload({ value, onChange, onRemove, endpoint = "/api/upload/video" }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("video/mp4") && !file.type.includes("video/webm")) {
      toast.error("Please upload an MP4 or WebM video file");
      return;
    }

    // 500MB client-side limit to match standard API Gateway/Lambda constraints
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video must be smaller than 500MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // Optional: configure onUploadProgress here if utilizing an advanced Axios setup
      });

      if (response.data?.url) {
        onChange(response.data.url, response.data?.key);
        toast.success("Video uploaded successfully");
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      toast.error("Failed to upload video to cloud storage");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (value) {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
        <video 
          src={value} 
          controls 
          className="w-full h-full object-contain"
        />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={onRemove}
            disabled={isUploading}
            className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-lg"
            aria-label="Remove video"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="video/mp4, video/webm"
        className="hidden"
      />
      
      {isUploading ? (
        <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
      ) : (
        <UploadCloud size={40} className="text-slate-400 mb-4" />
      )}
      
      <p className="text-base font-bold text-slate-700">
        {isUploading ? "Uploading to AWS S3... Do not close window." : "Click to select a video file"}
      </p>
      <p className="text-sm text-slate-500 mt-2">MP4 or WebM format recommended. Max 500MB.</p>
    </div>
  );
}