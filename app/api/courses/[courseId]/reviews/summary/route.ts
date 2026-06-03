import { NextResponse } from "next/server";

import { getReviewSummary } from "@/actions/review.actions";

type RouteParams = {
  params: Promise<{
    courseId: string;
  }>;
};

/**
 * GET /api/courses/[courseId]/reviews/summary
 * Get review summary for a course.
 */
export async function GET(
  _request: Request,
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

    const result = await getReviewSummary(courseId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status || 404 },
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
    console.error("[Review Summary GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}