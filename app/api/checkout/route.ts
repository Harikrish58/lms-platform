import { NextResponse } from "next/server";

import { createCheckoutSession } from "@/actions/payment.actions";
import { authMiddleware } from "@/lib/middleware/auth";

/**
 * POST /api/checkout
 * Creates a Stripe checkout session for a course purchase.
 */
export async function POST(request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const body: { courseId?: string } = await request.json();

    const { courseId } = body;

    // Validate required payload before creating checkout session
    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 },
      );
    }

    const result = await createCheckoutSession(
      courseId,
      auth.user.id,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        {
          status: result.status || 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("[Checkout POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}