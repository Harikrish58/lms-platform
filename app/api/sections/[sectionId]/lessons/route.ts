import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { createLesson, getLessonsBySection } from "@/actions/lesson.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";

type RouteParams = {
  params: Promise<{
    sectionId: string;
  }>;
};

/**
 * GET /api/sections/[sectionId]/lessons
 * Get all lessons for a section.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const { sectionId } = await params;

    if (!sectionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Section ID is required",
        },
        { status: 400 },
      );
    }

    const result = await getLessonsBySection(
      sectionId,
      auth.user.id,
      auth.user.role,
    );

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
    console.error("[Section Lessons GET Error]", error);

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
 * POST /api/sections/[sectionId]/lessons
 * Create a new empty lesson (draft) inside a section.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const roleCheck = requireRole(auth.user.role, [
      Role.INSTRUCTOR,
      Role.ADMIN,
    ]);

    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const { sectionId } = await params;

    if (!sectionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Section ID is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = await createLesson(
      sectionId,
      auth.user.id,
      auth.user.role,
      body,
      {},
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
    console.error("[Section Lessons POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
