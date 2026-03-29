import {prisma} from "@/lib/prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginUser = async (data: unknown) => {
  try {
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid input data",
      };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },  
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while logging in",
    }
  }
}