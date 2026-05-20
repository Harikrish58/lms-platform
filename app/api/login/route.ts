import {
  validateUserCredentials,
  AUTH_COOKIE_MAX_AGE,
} from "@/actions/user.actions";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
      secure: false, // localhost dev
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    console.log("COOKIE SET SUCCESSFULLY");

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
