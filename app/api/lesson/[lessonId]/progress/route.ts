import { NextResponse } from "next/server";

import {
  getCourseProgress,
  markLessonComplete,
} from "@/actions/progress.actions";
import { authMiddleware } from "@/lib/middleware/auth";

type LessonParams = {
  params: Promise<{
    lessonId: string;
  }>;
};

/**
 * POST /api/lesson/[lessonId]/progress
 * Mark a lesson as completed.
 */
export async function POST(_request: Request, { params }: LessonParams) {
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

    const result = await markLessonComplete(
      lessonId,
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
        message: result.message,
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Lesson Progress POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
