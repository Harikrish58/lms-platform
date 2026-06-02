import { NextResponse } from "next/server";
import { getCourseForInstructor } from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 },
      );
    }

    const auth = await authMiddleware();

    if (!auth.success || auth.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // Fetches the draft AND includes sections/lessons to fix the iterable error
    const result = await getCourseForInstructor(courseId, auth.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("error fetching instructor course edit details", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
