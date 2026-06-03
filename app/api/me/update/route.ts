import { NextResponse } from "next/server";

import { authMiddleware } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/me/update
 * Update the authenticated user's profile.
 */
export async function PATCH(request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const body = await request.json();

    const { name, avatarUrl } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: auth.user.id,
      },
      data: {
        name,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Profile Update PATCH Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}