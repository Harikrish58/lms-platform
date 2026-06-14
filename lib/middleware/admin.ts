import { NextResponse } from "next/server";

import { authMiddleware } from "@/lib/middleware/auth";

type AuthResult = Awaited<ReturnType<typeof authMiddleware>>;

type AdminSuccess = {
  success: true;
  user: Extract<AuthResult, { success: true }>["user"];
};

type AdminFailure = {
  success: false;
  error: NextResponse;
};

type AdminResult = AdminSuccess | AdminFailure;

export const adminMiddleware = async (): Promise<AdminResult> => {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth;
    }

    if (auth.user.role !== "ADMIN") {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            message: "Admin access required",
          },
          { status: 403 },
        ),
      };
    }

    return {
      success: true,
      user: auth.user,
    };
  } catch (error) {
    console.error("Admin middleware error:", error);

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          message: "Internal Server Error",
        },
        { status: 500 },
      ),
    };
  }
};
