import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

import { authMiddleware } from "@/lib/middleware/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload/image
 * Upload an image to Cloudinary.
 */
export async function POST(request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "lms_platform",
      resource_type: "image",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          url: uploadResponse.secure_url,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Image Upload POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during image upload",
      },
      { status: 500 },
    );
  }
}