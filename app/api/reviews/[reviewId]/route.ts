import { deleteReview, updateReview } from "@/actions/review.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.success) {
      return auth.error;
    }

    const { reviewId } = await params;
    const body = await request.json();

    const result = await updateReview(reviewId, auth.user.id, body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Review updated successfully",
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error updating review",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.success) {
      return auth.error;
    }

    const { reviewId } = await params;

    const result = await deleteReview(reviewId, auth.user.id);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Review deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error updating review",
      },
      { status: 500 },
    );
  }
}
