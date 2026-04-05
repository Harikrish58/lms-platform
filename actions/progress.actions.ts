import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { canAccessCourse } from "./enrollment.actions";

type MarkLessonCompleteResponse =
  | {
      success: true;
      message: string;
      data: {
        completed: boolean;
      };
    }
  | {
      success: false;
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
        message: "Lesson not found",
      };
    }

    if (!lesson.section) {
      return {
        success: false,
        message: "Lesson is not associated with any section",
      };
    }

    const courseId = lesson.section.courseId;

    const hasAccess = await canAccessCourse(userId, role, courseId);
    if (!hasAccess) {
      return {
        success: false,
        message: "You do not have access to this course",
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
      message: "Lesson marked as completed",
      data: {
        completed: progress.completed,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error marking lesson as complete",
    };
  }
};

type GetCourseProgressResponse =
  | {
      success: true;
      data: {
        totalLessons: number;
        completedLessons: number;
        progressPercentage: number;
        completedLessonIds: string[];
      };
    }
  | {
      success: false;
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
        message: "Course not found",
      };
    }

    const hasAccess = await canAccessCourse(userId, role, courseId);
    if (!hasAccess) {
      return {
        success: false,
        message: "You do not have access to this course",
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
        data: {
          totalLessons: 0,
          completedLessons: 0,
          progressPercentage: 100,
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
      data: {
        totalLessons,
        completedLessons: completedCount,
        progressPercentage,
        completedLessonIds,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error fetching course progress",
    };
  }
};
