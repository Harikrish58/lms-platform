import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/schemas/course.schema";

export const createCourse = async (data: unknown) => {
  try {
    // Validate the input data using the course schema
    const validatedData = courseSchema.parse(data);

    // Create the course in the database using Prisma
    const course = await prisma.course.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        instructorId: validatedData.instructorId,
      },
    });

    // Return the created course data
    return {
      success: true,
      data: course,
    };
    // If validation fails, Zod will throw an error which will be caught in the catch block
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred while creating the course",
    };
  }
};
