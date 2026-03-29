import {
  deleteCourse,
  getCourseById,
  updateCourse,
} from "@/actions/course.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 },
      );
    }

    const result = await getCourseById(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        {
          status: result.message === "Course not found" ? 404 : 400,
        },
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
          error instanceof Error ? error.message : "Error fetching course",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = await updateCourse(id, body, auth.user.id);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        {
          status:
            result.message === "Course not found"
              ? 404
              : result.message === "Not authorized to update this course"
                ? 403
                : 400,
        },
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
          error instanceof Error ? error.message : "Error updating course",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 },
      );
    }

    const result = await deleteCourse(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        {
          status:
            result.message === "Course not found"
              ? 404
              : result.message === "Unauthorized to delete this course"
                ? 403
                : 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error deleting course",
      },
      { status: 500 },
    );
  }
}
