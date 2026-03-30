import { registerUser } from "@/actions/user.actions";
import { NextResponse } from "next/server";

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
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unknown error occurred while registering",
      },
      { status: 500 },
    );
  }
}
