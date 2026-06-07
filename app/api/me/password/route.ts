import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { updateUserPassword } from "@/actions/user.actions";

export async function POST(request: Request) {
  try {
    const auth = await authMiddleware();
    if (!auth.success) return auth.error;

    const { currentPassword, newPassword } = await request.json();
    const result = await updateUserPassword(auth.user.id, currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error);    
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}