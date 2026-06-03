import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_MAX_AGE,
  validateUserCredentials,
} from "@/actions/user.actions";

/**
 * POST /api/login
 * Authenticate a user and set the auth cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await validateUserCredentials(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status },
      );
    }

    if (!result.token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token generation failed",
        },
        { status: 500 },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: result.user,
        },
      },
      { status: 200 },
    );

    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("[Login POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}