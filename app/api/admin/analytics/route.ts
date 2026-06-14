import { NextResponse } from "next/server";

import { adminMiddleware } from "@/lib/middleware/admin";
import { getAdminAnalytics } from "@/actions/admin.actions";

export async function GET() {
  try {
    const admin = await adminMiddleware();

    if (!admin.success) {
      return admin.error;
    }

    const analytics = await getAdminAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Admin analytics route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}