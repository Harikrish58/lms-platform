import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/schemas/course.schema";
import { Course } from "@prisma/client";
import { ZodError } from "zod";

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
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while creating the course";

    return {
      success: false,
      message,
    };
  }
};

export const getCourses = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  try {
    const skip = (page - 1) * limit;

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count(),
    ]);

    const totalPages = Math.ceil(totalCourses / limit);

    return {
      success: true,
      data: courses,
      meta: {
        total: totalCourses,
        totalPages,
        page,
        limit,
      },
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while creating the course";

    return {
      success: false,
      message,
    };
  }
};

type GetCourseByIdResponse =
  | {
      success: true;
      data: Course;
    }
  | {
      success: false;
      message: string;
    };

export const getCourseById = async (
  id: string,
): Promise<GetCourseByIdResponse> => {
  try {
    if (!id) {
      return {
        success: false,
        message: "Course ID is required",
      };
    }
    const course = await prisma.course.findUnique({
      where: { id },
    });
    if (!course) {
      return {
        success: false,
        message: "Course not found",
      };
    }
    return {
      success: true,
      data: course,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching the course";

    return {
      success: false,
      message,
    };
  }
};

export const updateCourse = async (
  id: string,
  data: unknown,
  userId: string,
) => {
  try {
    const validatedData = courseSchema.partial().parse(data);

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return {
        success: false,
        message: "Course not found",
      };
    }

    if (userId && course.instructorId !== userId) {
      return {
        success: false,
        message: "Unauthorized to update this course",
      };
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: validatedData,
    });

    return {
      success: true,
      data: updatedCourse,
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while updating the course";

    return {
      success: false,
      message,
    };
  }
};

export const deleteCourse = async (id: string, userId?: string) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });
    if (!course) {
      return {
        success: false,
        message: "Course not found",
      };
    }

    if (userId && course.instructorId !== userId) {
      return {
        success: false,
        message: "Unauthorized to delete this course",
      };
    }

    await prisma.$transaction(async (tx) => {
      const sections = await tx.section.findMany({
        where: { courseId: id },
        select: { id: true },
      });

      const sectionIds = sections.map((section) => section.id);

      const lessons = await tx.lesson.findMany({
        where: { sectionId: { in: sectionIds } },
        select: { id: true },
      });

      const lessonIds = lessons.map((lesson) => lesson.id);

      if (lessonIds.length > 0) {
        await tx.progress.deleteMany({
          where: { lessonId: { in: lessonIds } },
        });
      }

      if (sectionIds.length > 0) {
        await tx.lesson.deleteMany({
          where: { sectionId: { in: sectionIds } },
        });
      }

      await tx.section.deleteMany({
        where: { courseId: id },
      });

      await tx.enrollment.deleteMany({
        where: { courseId: id },
      });

      await tx.review.deleteMany({
        where: { courseId: id },
      });

      await tx.course.delete({
        where: { id },
      });
    });

    return {
      success: true,
      message: "Course deleted successfully",
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while updating the course";

    return {
      success: false,
      message,
    };
  }
};
