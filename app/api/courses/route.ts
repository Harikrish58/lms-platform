import { NextResponse } from "next/server";
import { createCourse, getCourses } from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";

export async function POST(request: Request) {
  try {
    const auth = await authMiddleware(request);
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
    console.error("error while creating course in route handler", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const safeLimit = Math.min(limit, 50);

    const result = await getCourses({
      page,
      limit: safeLimit,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      minRating: searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined,
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
    console.error("failed to fetch courses in route handler", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
