import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/schemas/user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const registerUser = async (data: unknown) => {
  try {
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message || "Invalid input data",
      };
    }

    const { email, name, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
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
    });

    return {
      success: true,
      status: 201,
      message: "User registered successfully",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error: unknown) {
    console.error("failed to register new user", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const loginUser = async (data: unknown) => {
  try {
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message || "Invalid input data",
      };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!user) {
      return {
        success: false,
        status: 401,
        message: "Invalid email or password",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        status: 401,
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
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
    );

    return {
      success: true,
      status: 200,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    };
  } catch (error: unknown) {
    console.error("login attempt failed", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};
