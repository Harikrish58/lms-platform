export const runtime = "nodejs";

import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  createLesson,
  deleteLesson,
  getLessonById,
  updateLesson,
} from "@/actions/lesson.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";

type RouteParams = {
  params: Promise<{
    lessonId: string;
  }>;
};

type LessonFiles = {
  video?: File;
  thumbnail?: File;
  pdf?: File;
};

const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

async function parseLessonRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let files: LessonFiles = {};

  if (!contentType.includes("multipart/form-data")) {
    return {
      body: await request.json(),
      files,
    };
  }

  const formData = await request.formData();

  const body = {
    title: formData.get("title")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    resources: formData.get("resources")?.toString() || undefined,
  };

  const videoFile = formData.get("video") as File | null;
  const thumbnailFile = formData.get("thumbnail") as File | null;
  const pdfFile = formData.get("pdf") as File | null;

  if (videoFile) {
    if (!videoFile.type.startsWith("video/")) {
      throw new Error("Invalid video file type");
    }

    if (videoFile.size > MAX_VIDEO_SIZE) {
      throw new Error("Video too large (Max 200MB)");
    }
  }

  if (thumbnailFile) {
    if (!thumbnailFile.type.startsWith("image/")) {
      throw new Error("Invalid thumbnail file type");
    }

    if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      throw new Error("Thumbnail too large (Max 5MB)");
    }
  }

  if (pdfFile) {
    if (pdfFile.type !== "application/pdf") {
      throw new Error("Invalid PDF file type");
    }

    if (pdfFile.size > MAX_PDF_SIZE) {
      throw new Error("PDF too large (Max 10MB)");
    }
  }

  files = {
    video: videoFile || undefined,
    thumbnail: thumbnailFile || undefined,
    pdf: pdfFile || undefined,
  };

  return {
    body,
    files,
  };
}

/**
 * GET /api/lesson/[lessonId]
 * Get lesson details for an authorized user.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson ID is required",
        },
        { status: 400 },
      );
    }

    const result = await getLessonById(lessonId, auth.user.id, auth.user.role);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Lesson GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/lesson/[lessonId]
 * Create a new lesson.
 */
export async function POST(request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);

    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Section ID is required",
        },
        { status: 400 },
      );
    }

    let body: unknown;
    let files: LessonFiles;

    try {
      const parsed = await parseLessonRequest(request);

      body = parsed.body;
      files = parsed.files;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Invalid upload data",
        },
        { status: 400 },
      );
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
      {
        success: true,
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("[Lesson POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/lesson/[lessonId]
 * Update an existing lesson.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);

    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson ID is required",
        },
        { status: 400 },
      );
    }

    let body: unknown;
    let files: LessonFiles;

    try {
      const parsed = await parseLessonRequest(request);

      body = parsed.body;
      files = parsed.files;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Invalid upload data",
        },
        { status: 400 },
      );
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
  } catch (error: unknown) {
    console.error("[Lesson PATCH Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/lesson/[lessonId]
 * Delete a lesson.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);

    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson ID is required",
        },
        { status: 400 },
      );
    }

    const result = await deleteLesson(lessonId, auth.user.id, auth.user.role);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Lesson DELETE Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
