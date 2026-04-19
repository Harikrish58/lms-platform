import { NextResponse } from "next/server";

export const validateFileType = (file: File) => {
  const allowedTypes = ["video/", "image/", "application/pdf"];
  return allowedTypes.some((type) => file.type.startsWith(type));
};

export const validateFileSize = (file: File, maxSizeInMB: number) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const getFileBuffer = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to process file buffer");
  }
};