import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export type JwtPayload = {
  id: string;
  role: Role;
  email?: string;
};

type AuthSuccess = {
  success: true;
  user: JwtPayload;
};

type AuthFailure = {
  success: false;
  error: NextResponse;
};

type AuthResult = AuthSuccess | AuthFailure;

export const verifyAuth = async (): Promise<JwtPayload | null> => {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("User session expired");
    } else {
      console.error("Auth verification error:", error);
    }

    return null;
  }
};

export const authMiddleware = async (): Promise<AuthResult> => {
  try {
    const user = await verifyAuth();

    if (!user) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 },
        ),
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Authentication middleware error:", error);

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
