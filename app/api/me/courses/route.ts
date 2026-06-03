import { NextResponse } from "next/server";

import { getMyCourses } from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";

/**
 * GET /api/me/courses
 * Get all courses enrolled in by the authenticated user.
 */
export async function GET(_request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const result = await getMyCourses(auth.user.id);

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
    console.error("[My Courses GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}