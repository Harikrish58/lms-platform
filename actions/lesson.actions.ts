import { prisma } from "@/lib/prisma";
import { canAccessCourse } from "@/actions/enrollment.actions";
import { Role } from "@prisma/client";
import {
  CreateLessonSchema,
  ReorderLessonsSchema,
  UpdateLessonSchema,
} from "@/schemas/lesson.Schema";

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

type CreateLessonResponse =
  | {
      success: true;
      status: number;
      data: {
        id: string;
        title: string;
        description: string;
        videoUrl: string;
        resources?: string | null;
        order: number;
        sectionId: string;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
      errors?: unknown;
    };

export const createLesson = async (
  sectionId: string,
  userId: string,
  role: Role,
  body: unknown,
): Promise<CreateLessonResponse> => {
  try {
    if (!sectionId) {
      return {
        success: false,
        status: 400,
        message: "Section ID is required",
      };
    }
    const parsed = CreateLessonSchema.safeParse(body);

    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { title, description, videoUrl, resources } = parsed.data;

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!section) {
      return {
        success: false,
        status: 404,
        message: "Section not found",
      };
    }

    if (role !== Role.ADMIN && section.course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized access to this section",
      };
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { sectionId: sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        videoUrl,
        resources: resources || null,
        order: newOrder,
        sectionId: sectionId,
      },
    });

    return {
      success: true,
      status: 201,
      data: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        resources: lesson.resources,
        order: lesson.order,
        sectionId: lesson.sectionId,
      },
    };
  } catch (error: unknown) {
    console.error("failed to create lesson", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type GetLessonsBySectionResponse =
  | {
      success: true;
      status: number;
      data: {
        id: string;
        title: string;
        description: string;
        order: number;
        videoUrl: string;
        resources?: string | null;
      }[];
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const getLessonsBySection = async (
  sectionId: string,
  userId: string,
  role: Role,
): Promise<GetLessonsBySectionResponse> => {
  try {
    if (!sectionId) {
      return {
        success: false,
        status: 400,
        message: "Section ID is required",
      };
    }

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      select: {
        courseId: true,
      },
    });

    if (!section) {
      return {
        success: false,
        status: 404,
        message: "Section not found",
      };
    }

    const hasAccess = await canAccessCourse(userId, role, section.courseId);

    if (!hasAccess) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized access to this section",
      };
    }

    const lessons = await prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        resources: true,
        order: true,
      },
    });

    return {
      success: true,
      status: 200,
      data: lessons,
    };
  } catch (error: unknown) {
    console.error("failed to fetch lessons by section", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type UpdateLessonResponse =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        id: string;
        title: string;
        description: string;
        videoUrl: string;
        resources: string | null;
        order: number;
        sectionId: string;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
      errors?: unknown;
    };

export const updateLesson = async (
  lessonId: string,
  userId: string,
  role: Role,
  body: unknown,
): Promise<UpdateLessonResponse> => {
  try {
    if (!lessonId) {
      return {
        success: false,
        status: 400,
        message: "Lesson ID is required",
      };
    }

    const parsed = UpdateLessonSchema.safeParse(body);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              select: { instructorId: true },
            },
          },
        },
      },
    });

    if (!existingLesson) {
      return {
        success: false,
        status: 404,
        message: "Lesson not found",
      };
    }

    if (!existingLesson.section) {
      return {
        success: false,
        status: 500,
        message: "Section not found",
      };
    }

    if (
      role !== Role.ADMIN &&
      existingLesson.section.course.instructorId !== userId
    ) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized to update lesson",
      };
    }

    const { title, description, videoUrl, resources } = parsed.data;

    if (
      title === undefined &&
      description === undefined &&
      videoUrl === undefined &&
      resources === undefined
    ) {
      return {
        success: false,
        status: 400,
        message: "No changes provided",
      };
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: title ?? existingLesson.title,
        description: description ?? existingLesson.description,
        videoUrl: videoUrl ?? existingLesson.videoUrl,
        resources: resources ?? existingLesson.resources,
      },
    });

    return {
      success: true,
      status: 200,
      message: "Lesson updated successfully",
      data: {
        id: updatedLesson.id,
        title: updatedLesson.title,
        description: updatedLesson.description,
        videoUrl: updatedLesson.videoUrl,
        resources: updatedLesson.resources,
        order: updatedLesson.order,
        sectionId: updatedLesson.sectionId,
      },
    };
  } catch (error: unknown) {
    console.error("failed to update lesson", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type DeleteLessonResponse =
  | {
      success: true;
      status: number;
      message: string;
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const deleteLesson = async (
  lessonId: string,
  userId: string,
  role: Role,
): Promise<DeleteLessonResponse> => {
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
      include: {
        section: {
          include: {
            course: {
              select: { instructorId: true },
            },
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

    if (role !== Role.ADMIN && lesson.section.course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized to delete lesson",
      };
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return {
      success: true,
      status: 200,
      message: "Lesson deleted successfully",
    };
  } catch (error: unknown) {
    console.error("failed to delete lesson", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type ReorderLessonsResponse =
  | {
      success: true;
      status: number;
      message: string;
    }
  | {
      success: false;
      status: number;
      message: string;
      errors?: unknown;
    };

export const reorderLessons = async (
  sectionId: string,
  userId: string,
  role: Role,
  body: unknown,
): Promise<ReorderLessonsResponse> => {
  try {
    if (!sectionId) {
      return {
        success: false,
        status: 400,
        message: "Section ID is required",
      };
    }

    const parsed = ReorderLessonsSchema.safeParse(body);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { lessonIds } = parsed.data;

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: { instructorId: true },
        },
      },
    });

    if (!section) {
      return {
        success: false,
        status: 404,
        message: "Section not found",
      };
    }

    if (role !== Role.ADMIN && section.course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized to reorder lessons",
      };
    }

    const existingLessons = await prisma.lesson.findMany({
      where: { sectionId },
      select: { id: true },
    });

    const existingIds = new Set(existingLessons.map((l) => l.id));

    const isValid = lessonIds.every((id) => existingIds.has(id));

    if (!isValid || lessonIds.length !== existingIds.size) {
      return {
        success: false,
        status: 400,
        message: "Invalid lesson IDs",
      };
    }

    await prisma.$transaction(
      lessonIds.map((id, index) =>
        prisma.lesson.update({
          where: { id },
          data: { order: index + 1 },
        }),
      ),
    );

    return {
      success: true,
      status: 200,
      message: "Lessons reordered successfully",
    };
  } catch (error: unknown) {
    console.error("failed to reorder lessons", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};
