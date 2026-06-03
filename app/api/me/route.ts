import { NextResponse } from "next/server";

import { authMiddleware } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/me
 * Get the authenticated user's profile.
 */
export async function GET() {
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
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
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

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[Me GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/me
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
    console.error("[Me PATCH Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}