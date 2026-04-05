import { enrollInCourse } from "@/actions/enrollment.actions";
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

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 },
      );
    }

    const result = await enrollInCourse(auth.user.id, courseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: true, message: result.message, data: result.data },
      { status: 201 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error enrolling in course",
      },
      { status: 500 },
    );
  }
}
