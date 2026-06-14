import { NextRequest, NextResponse } from "next/server";
import { adminMiddleware } from "@/lib/middleware/admin";
import { changeUserRole } from "@/actions/admin.actions";
import { Role } from "@/generated/prisma/browser";

type Params = Promise<{
  id: string;
}>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const admin = await adminMiddleware();

    if (!admin.success) {
      return admin.error;
    }

    const { id } = await params;

    const body = await request.json();

    const role = body.role as Role;

    if (
      !["STUDENT", "INSTRUCTOR", "ADMIN"].includes(
        role,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 },
      );
    }

    const user = await changeUserRole(
      id,
      role,
      admin.user.id,
    );

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Change user role error:",
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