import { NextResponse } from "next/server";

import { adminMiddleware } from "@/lib/middleware/admin";
import { deleteReview } from "@/actions/admin.actions";

type RouteParams = Promise<{
  id: string;
}>;

export async function DELETE(
  request: Request,
  { params }: { params: RouteParams },
) {
  try {
    const admin = await adminMiddleware();

    if (!admin.success) {
      return admin.error;
    }

    const { id } = await params;

    await deleteReview(id);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
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
      {
        status: 400,
      },
    );
  }
}