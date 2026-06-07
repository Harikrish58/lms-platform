import { NextResponse } from "next/server";

import { authMiddleware } from "@/lib/middleware/auth";
import { getUserLearningStats } from "@/actions/user.actions";

export async function GET() {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const stats = await getUserLearningStats(auth.user.id);

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("[Stats Error]", error);

    return NextResponse.json(
      {
        message: "Failed to load stats",
      },
      { status: 500 },
    );
  }
}