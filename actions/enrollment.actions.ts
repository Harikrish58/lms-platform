import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const enrollInCourse = async (userId: string, courseId: string) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    });

    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found",
      };
    }

    if (course.instructorId === userId) {
      return {
        success: false,
        status: 400,
        message: "Instructors cannot enroll in their own courses",
      };
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return {
        success: false,
        status: 400,
        message: "Already enrolled in this course",
      };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    return {
      success: true,
      status: 201,
      message: "Successfully enrolled in course",
      data: enrollment,
    };
  } catch (error: unknown) {
    console.error("failed to enroll user in course", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const isUserEnrolledInCourse = async (
  userId: string,
  courseId: string,
) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    return !!enrollment;
  } catch (error: unknown) {
    console.error("error checking enrollment status", error);
    return false;
  }
};

export const canAccessCourse = async (
  userId: string,
  role: Role,
  courseId: string,
) => {
  try {
    if (role === Role.ADMIN) return true;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) return false;

    if (course.instructorId === userId) return true;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return !!enrollment;
  } catch (error: unknown) {
    console.error("access check failed for course", error);
    return false;
  }
};
