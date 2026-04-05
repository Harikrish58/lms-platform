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
        message: "Course not found",
      };
    }

    if (course.instructorId === userId) {
      return {
        success: false,
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
      message: "Successfully enrolled in course",
      data: enrollment,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error enrolling in course",
    };
  }
};

export const isUserEnrolledInCourse = async (
  userId: string,
  courseId: string,
) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });
  return !!enrollment;
};

export const canAccessCourse = async (
  userId: string,
  role: Role,
  courseId: string,
) => {
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
};
