import { NextResponse } from "next/server";

import { enrollInCourse } from "@/actions/enrollment.actions";
import { authMiddleware } from "@/lib/middleware/auth";

type RouteParams = {
  params: Promise<{
    courseId: string;
  }>;
};

/**
 * POST /api/enroll/[courseId]
 * Enroll the authenticated user in a course.
 */
export async function POST(
  _request: Request,
  { params }: RouteParams,
) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 },
      );
    }

    const result = await enrollInCourse(auth.user.id, courseId);

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
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("[Enrollment POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}