import { NextResponse } from "next/server";

import { deleteReview, updateReview } from "@/actions/review.actions";
import { authMiddleware } from "@/lib/middleware/auth";

type RouteParams = {
  params: Promise<{
    reviewId: string;
  }>;
};

/**
 * PATCH /api/reviews/[reviewId]
 * Update a review.
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams,
) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const { reviewId } = await params;

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Review ID is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = await updateReview(
      reviewId,
      auth.user.id,
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
        message: "Review updated successfully",
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Review PATCH Error]", error);

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
 * DELETE /api/reviews/[reviewId]
 * Delete a review.
 */
export async function DELETE(
  _request: Request,
  { params }: RouteParams,
) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const { reviewId } = await params;

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Review ID is required",
        },
        { status: 400 },
      );
    }

    const result = await deleteReview(
      reviewId,
      auth.user.id,
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
        message: "Review deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Review DELETE Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}