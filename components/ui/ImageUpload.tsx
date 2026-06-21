"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  endpoint?: string;
  variant?: "avatar" | "thumbnail";
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  endpoint = "/api/upload/image",
  variant = "thumbnail"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAvatar = variant === "avatar";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Safely extract the URL depending on how the backend formats the response
      const url = response.data?.data?.url || response.data?.url || response.data?.secure_url || response.data?.imageUrl;

      if (url) {
        onChange(url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload succeeded but no URL was returned");
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
      <div 
        className={`relative overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group ${
          isAvatar ? "aspect-square w-32 h-32 rounded-full mx-auto" : "aspect-video w-full rounded-2xl"
        }`}
      >
        <Image
          src={value}
          alt="Uploaded Preview"
          fill
          sizes={isAvatar ? "128px" : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"}
          className="object-cover"
        />

        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
          <button
            type="button"
            onClick={onRemove}
            disabled={isUploading}
            className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xl"
            title="Remove Image"
          >
            <X size={isAvatar ? 16 : 20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-teal-50 hover:border-teal-300 transition-all cursor-pointer ${
        isUploading ? "opacity-50 pointer-events-none" : ""
      } ${
        isAvatar ? "aspect-square w-32 h-32 rounded-full mx-auto p-4" : "rounded-2xl w-full p-10"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
      
      {isUploading ? (
        <Loader2 size={isAvatar ? 24 : 40} className="text-teal-600 animate-spin mb-2" />
      ) : (
        <UploadCloud size={isAvatar ? 24 : 40} className="text-slate-400 mb-2" />
      )}
      
      {!isAvatar && (
        <>
          <p className="text-base font-bold text-slate-700">
            {isUploading ? "Uploading..." : "Click to upload"}
          </p>
          <p className="text-sm text-slate-500 mt-2">16:9 ratio recommended</p>
        </>
      )}
    </div>
  );
}