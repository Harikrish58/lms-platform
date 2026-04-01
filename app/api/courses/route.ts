import { NextResponse } from "next/server";
import { createCourse, getCourses } from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const auth = await authMiddleware(request);
    if (!auth.success) return auth.error;

    const roleCheck = requireRole(auth.user.role, ["INSTRUCTOR"]);
    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const result = await createCourse(body, auth.user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to create course",
        },
        {
          status: 400,
        },
      );
    }
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while creating the course";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const safeLimit = Math.min(limit, 50); // Cap limit to prevent abuse (50 = max items per page)

    const result = await getCourses({ page, limit: safeLimit });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to fetch courses",
        },
        {
          status: 400,
        },
      );
    }

    const totalCourses = result.meta?.total || 0;
    const totalPages = safeLimit > 0 ? Math.ceil(totalCourses / safeLimit) : 0;

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        meta: {
          ...result.meta,
          limit: safeLimit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching courses";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
}
