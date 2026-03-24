import { prisma } from "@/lib/prisma";

export const createCourse = async () => {
  try {
    const course = await prisma.course.create({
      data: {
        title: " React for Beginners",
        description: "Learn React step by step",
        price: 49.99,
        instructorId: "d0372743-a740-42a5-bd24-668db58437eb",
      },
    });
    console.log("Course created:", course);
    return course;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};
