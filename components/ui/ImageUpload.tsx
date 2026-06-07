"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  endpoint?: string;
}

export default function ImageUpload({ value, onChange, onRemove, endpoint = "/api/upload" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (e.g., max 4MB)
    if (!file.type.includes("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be smaller than 4MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Assumes you have a generic upload route that uses your lib/utils/cloudinaryUpload.ts
      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.data?.url) {
        onChange(response.data.data.url);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (value) {
  return (
    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 group">
      <Image
        src={value}
        alt="Upload preview"
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
        <button
          onClick={onRemove}
          disabled={isUploading}
          className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-lg"
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
      className={`border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
      
      {isUploading ? (
        <Loader2 size={32} className="text-indigo-600 animate-spin mb-3" />
      ) : (
        <UploadCloud size={32} className="text-slate-400 mb-3" />
      )}
      
      <p className="text-sm font-bold text-slate-700">
        {isUploading ? "Uploading to Cloudinary..." : "Click to upload image"}
      </p>
      <p className="text-xs text-slate-500 mt-1">16:9 aspect ratio recommended (PNG, JPG)</p>
    </div>
  );
}