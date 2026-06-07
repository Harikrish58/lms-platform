import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

export async function DELETE() {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.user.id,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Instructor and admin accounts cannot be deleted directly. Please contact support.",
        },
        { status: 403 },
      );
    }

    await prisma.user.delete({
      where: {
        id: auth.user.id,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 },
    );

    response.cookies.set("token", "", {
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Delete Account Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete account",
      },
      { status: 500 },
    );
  }
}
