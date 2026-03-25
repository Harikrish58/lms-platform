import { NextResponse } from "next/server";
import { createCourse } from "@/actions/course.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await createCourse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: result.message || "Failed to create course",
        },
        {
          status: 400,
        },
      );
      return NextResponse.json(result.data, {
        status: 201,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "An error occurred while creating the course",
      },
      {
        status: 500,
      },
    );
  }
}
