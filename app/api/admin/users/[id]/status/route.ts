import { NextResponse } from "next/server";

import { adminMiddleware } from "@/lib/middleware/admin";
import { toggleUserStatus } from "@/actions/admin.actions";

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

    const user = await toggleUserStatus(id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Toggle user status error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}