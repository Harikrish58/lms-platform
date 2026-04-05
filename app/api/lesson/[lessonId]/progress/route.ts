import { markLessonComplete } from "@/actions/progress.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const { lessonId } = await params;

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
        {
          status:
            result.message === "Lesson not found"
              ? 404
              : result.message === "You do not have access to this lesson"
                ? 403
                : 400,
        },
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unknown error occurred while marking the lesson as complete",
      },
      { status: 500 },
    );
  }
}
