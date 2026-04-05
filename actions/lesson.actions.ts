import { prisma } from "@/lib/prisma";
import { canAccessCourse } from "@/actions/enrollment.actions";
import { Role } from "@prisma/client";

type GetLessonByIdResponse =
  | {
      success: true;
      data: {
        id: string;
        title: string;
        description: string | null;
        videoUrl: string | null;
        resources?: string | null;
      };
    }
  | {
      success: false;
      message: string;
    };

export const getLessonById = async (
  lessonId: string,
  userId: string,
  role: Role,
): Promise<GetLessonByIdResponse> => {
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
        title: true,
        description: true,
        videoUrl: true,
        resources: true,
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
        message: "You do not have access to this lesson",
      };
    }
    return {
      success: true,
      data: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        resources: lesson.resources,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching the lesson",
    };
  }
};
