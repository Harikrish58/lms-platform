import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/schemas/user.schema";

const JWT_SECRET = process.env.JWT_SECRET;

export const AUTH_COOKIE_MAX_AGE = process.env.JWT_EXPIRES_IN
  ? Number.parseInt(process.env.JWT_EXPIRES_IN, 10)
  : 60 * 60 * 24 * 7;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

/**
 * User Authentication & Profile Actions
 *
 * Handles:
 * - User registration
 * - User authentication
 * - JWT generation
 * - User profile updates
 */

export const registerUser = async (data: unknown) => {
  try {
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const { email, name, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return {
        success: false,
        status: 409,
        message: "Email is already registered",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "STUDENT",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: AUTH_COOKIE_MAX_AGE,
      },
    );

    return {
      success: true,
      status: 201,
      token,
      user,
    };
  } catch (error: unknown) {
    console.error("Failed to register new user", error);

    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const validateUserCredentials = async (data: unknown) => {
  try {
    const validatedData = loginSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        success: false,
        status: 400,
        message: "Invalid input",
      };
    }

    const { email, password } = validatedData.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user?.password) {
      return {
        success: false,
        status: 401,
        message: "Invalid credentials",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return {
        success: false,
        status: 401,
        message: "Invalid credentials",
      };
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: AUTH_COOKIE_MAX_AGE,
      },
    );

    return {
      success: true,
      status: 200,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  } catch (error: unknown) {
    console.error("Failed to validate user credentials", error);

    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const updateUserProfile = async (
  userId: string,
  data: {
    name?: string;
    avatarUrl?: string;
  },
) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error: unknown) {
    console.error(
      `Failed to update profile for user ${userId}`,
      error,
    );

    return {
      success: false,
      message: "Internal Server Error",
    };
  }
};