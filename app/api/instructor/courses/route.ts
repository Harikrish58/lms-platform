import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getInstructorCourses } from "@/actions/course.actions";

// This route now correctly returns the LIST of courses for your dashboard table
export async function GET(req: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success || auth.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const result = await getInstructorCourses(auth.user.id);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Dashboard route handler error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}