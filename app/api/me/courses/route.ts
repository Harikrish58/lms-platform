import { NextResponse } from "next/server";
import { getMyCourses } from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";

export async function GET(request: Request) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const result = await getMyCourses(auth.user.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
