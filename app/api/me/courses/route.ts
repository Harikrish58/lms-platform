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
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("error fetching user courses in route handler", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
