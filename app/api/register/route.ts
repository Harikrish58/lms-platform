import { NextResponse } from "next/server";

import { registerUser } from "@/actions/user.actions";

/**
 * POST /api/register
 * Register a new user and set the authentication cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await registerUser(body);

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
      { status: 201 },
    );

    response.cookies.set({
      name: "token",
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("[Register POST Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}