import { NextResponse } from "next/server";

import { createReview, getCourseReviews } from "@/actions/review.actions";
import { authMiddleware } from "@/lib/middleware/auth";

type RouteParams = {
  params: Promise<{
    courseId: string;
  }>;
};

/**
 * POST /api/courses/[courseId]/reviews
 * Create a review for a course.
 */
export async function POST(
  request: Request,
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

    const body = await request.json();

    const result = await createReview(
      courseId,
      auth.user.id,
      auth.user.role,
      body,
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
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("[Course Review POST Error]", error);

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
 * GET /api/courses/[courseId]/reviews
 * Get paginated course reviews.
 */
export async function GET(
  request: Request,
  { params }: RouteParams,
) {
  try {
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

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1,
    );

    const limit = Math.min(
      Math.max(1, Number(searchParams.get("limit")) || 10),
      50,
    );

    const result = await getCourseReviews(courseId, {
      page,
      limit,
      sort: searchParams.get("sort") || "latest",
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
        message: result.message,
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Course Review GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}