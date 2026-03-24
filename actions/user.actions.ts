import { prisma } from "@/lib/prisma";

export const createUser = async () => {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Hari",
        email: "hari@example.com",
        password: "password123",
      },
    });
    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
  }
};
