import { Role } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { getCourseForInstructor } from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";

type RouteParams = {
  params: Promise<{
    courseId: string;
  }>;
};

/**
 * GET /api/instructor/courses/[courseId]
 * Get course details for the authenticated instructor.
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

    const result = await getCourseForInstructor(
      courseId,
      auth.user.id,
      auth.user.role
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
    console.error("[Instructor Course GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}