import { prisma } from "@/lib/prisma";
import { canAccessCourse } from "@/actions/enrollment.actions";
import { Role } from "@prisma/client";

type GetLessonByIdResponse =
  | {
      success: true;
      status: number;
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
      status: number;
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
        status: 400,
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

    return {
      success: true,
      status: 200,
      data: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        resources: lesson.resources,
      },
    };
  } catch (error: unknown) {
    console.error("failed to get lesson details", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};
