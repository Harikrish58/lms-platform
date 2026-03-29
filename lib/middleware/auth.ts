import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

type AuthResult =
  | {
      success: true;
      user: AuthUser;
    }
  | {
      success: false;
      error: NextResponse;
    };

export async function authMiddleware(request: Request): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        ),
      };
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    return {
      success: true,
      user: decoded,
    };
  } catch {
    return {
      success: false,
      error: NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }
}
