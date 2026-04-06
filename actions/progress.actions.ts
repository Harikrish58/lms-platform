import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { canAccessCourse } from "./enrollment.actions";

type MarkLessonCompleteResponse =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        completed: boolean;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const markLessonComplete = async (
  lessonId: string,
  userId: string,
  role: Role,
): Promise<MarkLessonCompleteResponse> => {
  try {
    if (!lessonId) {
      return {
        success: false,
        status: 400,
        message: "Lesson ID is required",
      };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        section: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      return {
        success: false,
        status: 404,
        message: "Lesson not found",
      };
    }

    if (!lesson.section) {
      return {
        success: false,
        status: 500,
        message: "Internal Server Error",
      };
    }

    const courseId = lesson.section.courseId;

    const hasAccess = await canAccessCourse(userId, role, courseId);
    if (!hasAccess) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized access to this lesson",
      };
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId,
        lessonId,
        completed: true,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Lesson marked as completed",
      data: {
        completed: progress.completed,
      },
    };
  } catch (error: unknown) {
    console.error("error updating lesson completion status", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type GetCourseProgressResponse =
  | {
      success: true;
      status: number;
      data: {
        totalLessons: number;
        completedLessons: number;
        progressPercentage: number;
        completedLessonIds: string[];
      };
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const getCourseProgress = async (
  courseId: string,
  userId: string,
  role: Role,
): Promise<GetCourseProgressResponse> => {
  try {
    if (!courseId) {
      return {
        success: false,
        status: 400,
        message: "Course ID is required",
      };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
      },
    });

    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found",
      };
    }

    const hasAccess = await canAccessCourse(userId, role, courseId);
    if (!hasAccess) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized access to this course",
      };
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        section: {
          courseId: courseId,
        },
      },
      select: {
        id: true,
      },
    });

    const lessonIds = lessons.map((lesson) => lesson.id);
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
      return {
        success: true,
        status: 200,
        data: {
          totalLessons: 0,
          completedLessons: 0,
          progressPercentage: 0,
          completedLessonIds: [],
        },
      };
    }

    const completedLessons = await prisma.progress.findMany({
      where: {
        userId,
        lessonId: {
          in: lessonIds,
        },
        completed: true,
      },
      select: {
        lessonId: true,
      },
    });

    const completedLessonIds = completedLessons.map(
      (progress) => progress.lessonId,
    );
    const completedCount = completedLessonIds.length;
    const progressPercentage = Math.round(
      (completedCount / totalLessons) * 100,
    );

    return {
      success: true,
      status: 200,
      data: {
        totalLessons,
        completedLessons: completedCount,
        progressPercentage,
        completedLessonIds,
      },
    };
  } catch (error: unknown) {
    console.error("failed to calculate course progress", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};
