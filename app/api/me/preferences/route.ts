import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

export async function GET() {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const preferences = await prisma.userPreference.findUnique({
      where: {
        userId: auth.user.id,
      },
      select: {
        courseUpdates: true,
        lessonNotifications: true,
        announcements: true,
        marketingEmails: true,
      },
    });

    if (!preferences) {
      return NextResponse.json(
        {
          success: false,
          message: "Preferences not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(preferences, {
      status: 200,
    });
  } catch (error) {
    console.error("[Preferences GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load preferences",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const body = await request.json();

    const preferences = await prisma.userPreference.upsert({
      where: {
        userId: auth.user.id,
      },
      update: {
        courseUpdates: body.courseUpdates,
        lessonNotifications: body.lessonNotifications,
        announcements: body.announcements,
        marketingEmails: body.marketingEmails,
      },
      create: {
        userId: auth.user.id,
        courseUpdates: body.courseUpdates ?? true,
        lessonNotifications: body.lessonNotifications ?? true,
        announcements: body.announcements ?? true,
        marketingEmails: body.marketingEmails ?? false,
      },
      select: {
        courseUpdates: true,
        lessonNotifications: true,
        announcements: true,
        marketingEmails: true,
      },
    });

    return NextResponse.json(preferences, {
      status: 200,
    });
  } catch (error) {
    console.error("[Preferences PATCH Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update preferences",
      },
      { status: 500 },
    );
  }
}
