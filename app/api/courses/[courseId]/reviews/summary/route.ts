import { getReviewSummary } from "@/actions/review.actions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const { courseId } = params;

    const result = await getReviewSummary(courseId);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 404 },
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
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching the review summary",
      },
      { status: 500 },
    );
  }
}
