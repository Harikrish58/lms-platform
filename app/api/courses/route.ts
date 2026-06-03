import { NextResponse } from "next/server";

import { createCourse, getCourses } from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";

/**
 * POST /api/courses
 * Create a new course.
 */
export async function POST(request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

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

    const body = await request.json();

    const result = await createCourse(body, auth.user.id);

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
    console.error("[Courses POST Error]", error);

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
 * GET /api/courses
 * Get paginated and filtered courses.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parseNumberParam = (key: string): number | undefined => {
      const value = searchParams.get(key);

      if (!value) {
        return undefined;
      }

      const parsedValue = Number(value);

      return Number.isNaN(parsedValue) ? undefined : parsedValue;
    };

    const page = Math.max(1, parseNumberParam("page") || 1);
    const limit = Math.max(1, parseNumberParam("limit") || 10);
    const safeLimit = Math.min(limit, 50);

    const result = await getCourses({
      page,
      limit: safeLimit,
      search: searchParams.get("search") || undefined,
      minPrice: parseNumberParam("minPrice"),
      maxPrice: parseNumberParam("maxPrice"),
      minRating: parseNumberParam("minRating"),
    });

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
        meta: result.meta,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Courses GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}