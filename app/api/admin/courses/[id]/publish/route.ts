import { NextResponse } from "next/server";

import { adminMiddleware } from "@/lib/middleware/admin";
import { toggleCoursePublishStatus } from "@/actions/admin.actions";

type RouteParams = Promise<{
  id: string;
}>;

export async function PATCH(
  request: Request,
  { params }: { params: RouteParams },
) {
  try {
    const admin = await adminMiddleware();

    if (!admin.success) {
      return admin.error;
    }

    const { id } = await params;

    const course =
      await toggleCoursePublishStatus(id);

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      { status: 400 },
    );
  }
}