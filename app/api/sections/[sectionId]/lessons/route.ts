import { NextResponse } from "next/server";

import { getLessonsBySection } from "@/actions/lesson.actions";
import { authMiddleware } from "@/lib/middleware/auth";

type RouteParams = {
  params: Promise<{
    sectionId: string;
  }>;
};

/**
 * GET /api/sections/[sectionId]/lessons
 * Get all lessons for a section.
 */
export async function GET(
  _request: Request,
  { params }: RouteParams,
) {
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