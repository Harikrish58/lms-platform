import {
  createLesson,
  deleteLesson,
  getLessonById,
  updateLesson,
} from "@/actions/lesson.actions";
import { authMiddleware } from "@/lib/middleware/auth";
import { requireRole } from "@/lib/utils/authorize";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson ID is required",
        },
        { status: 400 },
      );
    }

    const result = await getLessonById(lessonId, auth.user.id, auth.user.role);

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
    console.error("error fetching lesson details in route handler", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);
    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    const body = await request.json();

    const result = await createLesson(
      sectionId || "",
      auth.user.id,
      auth.user.role,
      body,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("error creating lesson in route handler", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);
    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson ID is required",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const result = await updateLesson(
      lessonId,
      auth.user.id,
      auth.user.role,
      body,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("error updating lesson in route handler", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.success) {
      return auth.error;
    }

    const roleCheck = requireRole(auth.user.role, [Role.INSTRUCTOR]);
    if (!roleCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: roleCheck.message || "Unauthorized",
        },
        { status: roleCheck.status || 403 },
      );
    }

    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson ID is required",
        },
        { status: 400 },
      );
    }

    const result = await deleteLesson(lessonId, auth.user.id, auth.user.role);

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
        message: result.message,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("error deleting lesson in route handler", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
