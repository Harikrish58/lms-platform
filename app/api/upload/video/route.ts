import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { authMiddleware } from "@/lib/middleware/auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

/**
 * POST /api/upload/video
 * Upload a video file to AWS S3.
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

    const fileExtension = file.name.split(".").pop();

    const uniqueKey = `courses/videos/${uuidv4()}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: uniqueKey,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: videoUrl,
          key: uniqueKey,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Video Upload POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during video upload",
        error:
        error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}