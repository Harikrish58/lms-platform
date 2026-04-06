import { createReview, getCourseReviews } from "@/actions/review.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.success) {
      return auth.error;
    }

    const { courseId } = await params;
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
        { status: result.message === "Course not found" ? 404 : 400 },
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
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error fetching course",
      },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;

    const { searchParams } = new URL(request.url);

    const response = await getCourseReviews(courseId, {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      sort: searchParams.get("sort") || "latest",
    });

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          message: response.message,
        },
        { status: response.message === "Course not found" ? 404 : 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: response.message,
        data: response.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error fetching course",
      },
      { status: 500 },
    );
  }
}
