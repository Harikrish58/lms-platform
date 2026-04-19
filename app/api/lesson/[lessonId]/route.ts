export const runtime = "nodejs";

import {
  createLesson,
  deleteLesson,
  getLessonById,
  updateLesson,
} from "@/actions/lesson.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, message: "Lesson ID is required" },
        { status: 400 },
      );
    }

    const auth = await authMiddleware(request);
    if (!auth.success) return auth.error;

    const result = await getLessonById(lessonId, auth.user.id, auth.user.role);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.success) return auth.error;

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);
    if (!roleCheck.success) {
      return NextResponse.json(
        { success: false, message: roleCheck.message || "Unauthorized" },
        { status: roleCheck.status || 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json(
        { success: false, message: "Section ID is required" },
        { status: 400 },
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let body: unknown;
    let files: {
      video?: File;
      thumbnail?: File;
      pdf?: File;
    } = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      body = {
        title: formData.get("title")?.toString() || undefined,
        description: formData.get("description")?.toString() || undefined,
        resources: formData.get("resources")?.toString() || undefined,
      };

      const videoFile = formData.get("video") as File | null;
      const thumbnailFile = formData.get("thumbnail") as File | null;
      const pdfFile = formData.get("pdf") as File | null;

      if (videoFile) {
        if (!videoFile.type.startsWith("video/")) {
          return NextResponse.json(
            { success: false, message: "Invalid video file type" },
            { status: 400 },
          );
        }
        if (videoFile.size > 200 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, message: "Video too large (Max 200MB)" },
            { status: 400 },
          );
        }
      }

      if (thumbnailFile && !thumbnailFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "Invalid thumbnail file type" },
          { status: 400 },
        );
      }

      if (thumbnailFile && thumbnailFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Thumbnail too large (Max 5MB)" },
          { status: 400 },
        );
      }

      if (pdfFile && pdfFile.type !== "application/pdf") {
        return NextResponse.json(
          { success: false, message: "Invalid PDF file type" },
          { status: 400 },
        );
      }

      if (pdfFile && pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "PDF too large (Max 10MB)" },
          { status: 400 },
        );
      }

      files = {
        video: videoFile || undefined,
        thumbnail: thumbnailFile || undefined,
        pdf: pdfFile || undefined,
      };
    } else {
      body = await request.json();
    }

    const result = await createLesson(
      sectionId,
      auth.user.id,
      auth.user.role,
      body,
      files,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, message: "Lesson ID is required" },
        { status: 400 },
      );
    }

    const auth = await authMiddleware(request);
    if (!auth.success) return auth.error;

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);
    if (!roleCheck.success) {
      return NextResponse.json(
        { success: false, message: roleCheck.message || "Unauthorized" },
        { status: roleCheck.status || 403 },
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let body: unknown;
    let files: {
      video?: File;
      thumbnail?: File;
      pdf?: File;
    } = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      body = {
        title: formData.get("title")?.toString() || undefined,
        description: formData.get("description")?.toString() || undefined,
        resources: formData.get("resources")?.toString() || undefined,
      };

      const videoFile = formData.get("video") as File | null;
      const thumbnailFile = formData.get("thumbnail") as File | null;
      const pdfFile = formData.get("pdf") as File | null;

      if (videoFile) {
        if (!videoFile.type.startsWith("video/")) {
          return NextResponse.json(
            { success: false, message: "Invalid video file type" },
            { status: 400 },
          );
        }
        if (videoFile.size > 200 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, message: "Video too large (Max 200MB)" },
            { status: 400 },
          );
        }
      }

      if (thumbnailFile && !thumbnailFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, message: "Invalid thumbnail file type" },
          { status: 400 },
        );
      }

      if (thumbnailFile && thumbnailFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Thumbnail too large (Max 5MB)" },
          { status: 400 },
        );
      }

      if (pdfFile && pdfFile.type !== "application/pdf") {
        return NextResponse.json(
          { success: false, message: "Invalid PDF file type" },
          { status: 400 },
        );
      }

      if (pdfFile && pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "PDF too large (Max 10MB)" },
          { status: 400 },
        );
      }

      files = {
        video: videoFile || undefined,
        thumbnail: thumbnailFile || undefined,
        pdf: pdfFile || undefined,
      };
    } else {
      body = await request.json();
    }

    const result = await updateLesson(
      lessonId,
      auth.user.id,
      auth.user.role,
      body,
      files,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, message: "Lesson ID is required" },
        { status: 400 },
      );
    }

    const auth = await authMiddleware(request);
    if (!auth.success) return auth.error;

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);
    if (!roleCheck.success) {
      return NextResponse.json(
        { success: false, message: roleCheck.message || "Unauthorized" },
        { status: roleCheck.status || 403 },
      );
    }

    const result = await deleteLesson(lessonId, auth.user.id, auth.user.role);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
