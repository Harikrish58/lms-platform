import { prisma } from "@/lib/prisma";
import {
  CreateSectionSchema,
  ReOrderSectionsSchema,
  UpdateSectionSchema,
} from "@/schemas/section.Schema";
import { Role } from "@prisma/client";

type CreateSectionResponse =
  | {
      success: true;
      status: number;
      data: {
        id: string;
        title: string;
        order: number;
        courseId: string;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
      errors?: unknown;
    };

export const createSection = async (
  courseId: string,
  userId: string,
  role: Role,
  body: unknown,
): Promise<CreateSectionResponse> => {
  try {
    if (!courseId) {
      return {
        success: false,
        status: 400,
        message: "Course ID is required.",
      };
    }

    const parsed = CreateSectionSchema.safeParse(body);

    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { title } = parsed.data;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found.",
      };
    }

    if (role !== Role.ADMIN && course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message:
          "You do not have permission to create a section for this course.",
      };
    }

    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastSection ? lastSection.order + 1 : 1;

    const section = await prisma.section.create({
      data: {
        title,
        courseId,
        order: newOrder,
      },
    });

    return {
      success: true,
      status: 201,
      data: {
        id: section.id,
        title: section.title,
        order: section.order,
        courseId: section.courseId,
      },
    };
  } catch (error: unknown) {
    console.error("Error creating section:", error);
    return {
      success: false,
      status: 500,
      message: "An error occurred while creating the section.",
    };
  }
};

type GetSectionsByCourseResponse =
  | {
      success: true;
      status: number;
      data: {
        id: string;
        title: string;
        order: number;
        courseId: string;
        totalLessons: number;
      }[];
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const getSectionsByCourse = async (
  courseId: string,
): Promise<GetSectionsByCourseResponse> => {
  try {
    if (!courseId) {
      return {
        success: false,
        status: 400,
        message: "Course ID is required.",
      };
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found.",
      };
    }
    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    const formattedSections = sections.map((section) => ({
      id: section.id,
      title: section.title,
      order: section.order,
      courseId: section.courseId,
      totalLessons: section._count.lessons,
    }));
    return {
      success: true,
      status: 200,
      data: formattedSections,
    };
  } catch (error: unknown) {
    console.error("Error fetching sections:", error);
    return {
      success: false,
      status: 500,
      message: "An error occurred while fetching sections.",
    };
  }
};

type UpdateSectionResponse =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        id: string;
        title: string;
        order: number;
        courseId: string;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
      errors?: unknown;
    };

export const updateSection = async (
  sectionId: string,
  userId: string,
  role: Role,
  body: unknown,
): Promise<UpdateSectionResponse> => {
  try {
    if (!sectionId) {
      return {
        success: false,
        status: 400,
        message: "Section ID is required.",
      };
    }
    const parsed = UpdateSectionSchema.safeParse(body);

    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { title } = parsed.data;
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
        message: "Section not found.",
      };
    }

    if (role !== Role.ADMIN && section.course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "You are not the owner of this section.",
      };
    }
    if (section.title === title) {
      return {
        success: false,
        status: 400,
        message: "No changes detected in the title.",
      };
    }
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: { title },
    });
    return {
      success: true,
      status: 200,
      message: "Section updated successfully.",
      data: {
        id: updatedSection.id,
        title: updatedSection.title,
        order: updatedSection.order,
        courseId: updatedSection.courseId,
      },
    };
  } catch (error: unknown) {
    console.error("Error updating section:", error);
    return {
      success: false,
      status: 500,
      message: "An error occurred while updating the section.",
    };
  }
};

type DeleteSectionResponse =
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

export const deleteSection = async (
  sectionId: string,
  userId: string,
  role: Role,
): Promise<DeleteSectionResponse> => {
  try {
    if (!sectionId) {
      return {
        success: false,
        status: 400,
        message: "Section ID is required.",
      };
    }
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
        message: "Section not found.",
      };
    }

    if (role !== Role.ADMIN && section.course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "You are not the owner of this section.",
      };
    }

    await prisma.section.delete({
      where: { id: sectionId },
    });
    return {
      success: true,
      status: 200,
      message: "Section deleted successfully.",
    };
  } catch (error: unknown) {
    console.error("Error deleting section:", error);
    return {
      success: false,
      status: 500,
      message: "An error occurred while deleting the section.",
    };
  }
};

type ReOrderSectionsResponse =
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

export const reOrderSections = async (
  courseId: string,
  userId: string,
  role: Role,
  body: unknown,
): Promise<ReOrderSectionsResponse> => {
  try {
    if (!courseId) {
      return {
        success: false,
        status: 400,
        message: "Course ID is required.",
      };
    }

    const parsed = ReOrderSectionsSchema.safeParse(body);

    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message,
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { sectionIds } = parsed.data;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        instructorId: true,
      },
    });

    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found.",
      };
    }

    if (role !== Role.ADMIN && course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "You are not the owner of this course.",
      };
    }

    const existingSections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    const existingIds = new Set(existingSections.map((section) => section.id));

    const isValid = sectionIds.every((id) => existingIds.has(id));

    if (!isValid || sectionIds.length !== existingIds.size) {
      return {
        success: false,
        status: 400,
        message: "Invalid section IDs.",
      };
    }

    await prisma.$transaction(
      sectionIds.map((id, index) =>
        prisma.section.update({
          where: { id },
          data: { order: index + 1 },
        }),
      ),
    );

    return {
      success: true,
      status: 200,
      message: "Sections reordered successfully.",
    };
  } catch (error: unknown) {
    console.error("failed to reorder sections", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
    };
  }
};
