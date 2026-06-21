import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

/**
 * Enrollment-related actions.
 *
 * Handles:
 * - Course enrollment
 * - Enrollment status checks
 * - Course access authorization
 */
export const enrollInCourse = async (userId: string, courseId: string) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        instructorId: true,
      },
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
      select: {
        id: true,
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
    console.error(
      `Failed to enroll user ${userId} in course ${courseId}`,
      error,
    );

    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

/**
 * Checks whether a user is enrolled in a course.
 */
export const isUserEnrolledInCourse = async (
  userId: string,
  courseId: string,
): Promise<boolean> => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
      },
    });

    return !!enrollment;
  } catch (error: unknown) {
    console.error(
      `Error checking enrollment status for user ${userId} and course ${courseId}`,
      error,
    );

    return false;
  }
};

/**
 * Determines whether a user can access a course.
 *
 * Access rules:
 * - Admins can access all courses
 * - Course instructors can access their own courses
 * - Enrolled students can access enrolled courses
 */
export const canAccessCourse = async (
  userId: string,
  role: Role,
  courseId: string,
): Promise<boolean> => {
  try {
    if (role === Role.ADMIN) {
      return true;
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        instructorId: true,
      },
    });

    if (!course) {
      return false;
    }

    if (course.instructorId === userId) {
      return true;
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
      },
    });

    return !!enrollment;
  } catch (error: unknown) {
    console.error(
      `Course access check failed for user ${userId} and course ${courseId}`,
      error,
    );

    return false;
  }
};
