import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { createCheckoutSession } from "@/actions/payment.actions";

export async function POST(request: Request) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const body = await request.json();
    const { courseId } = body;

    const result = await createCheckoutSession(
      courseId,
      auth.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("checkout route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}