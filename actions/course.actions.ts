import { Prisma } from "@/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/schemas/course.schema";
import { Course, Role } from "@prisma/client";
import { ZodError } from "zod";

export const createCourse = async (data: unknown, userId: string) => {
  try {
    const validatedData = courseSchema.parse(data);

    const course = await prisma.course.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        instructorId: userId,
      },
    });

    return {
      success: true,
      status: 201,
      data: course,
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error(
        "validation error while creating course",
        error.flatten().fieldErrors,
      );
      return {
        success: false,
        status: 400,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("failed to create course", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const getCourses = async ({
  page = 1,
  limit = 10,
  search,
  minPrice,
  maxPrice,
  minRating,
}: {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}) => {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      isPublished: true,
    };

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minRating !== undefined) {
      where.averageRating = {
        gte: minRating,
      };
    }

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              sections: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail,
      averageRating: course.averageRating,
      totalReviews: course.totalReviews,

      instructor: {
        id: course.instructor.id,
        name: course.instructor.name,
        avatarUrl: course.instructor.avatarUrl,
      },

      enrollmentsCount: course._count.enrollments,
      sectionsCount: course._count.sections,
    }));

    const totalPages = Math.ceil(totalCourses / limit);

    return {
      success: true,
      status: 200,
      data: formattedCourses,
      meta: {
        total: totalCourses,
        totalPages,
        page,
        limit,
      },
    };
  } catch (error: unknown) {
    console.error("error fetching courses list", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type CourseWithContent = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  averageRating: number;
  totalReviews: number;

  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };

  _count: {
    enrollments: number;
  };

  sections: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
    }[];
  }[];
};
type GetCourseByIdResponse =
  | {
      success: true;
      status: number;
      data: CourseWithContent;
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const getCourseById = async (
  id: string,
): Promise<GetCourseByIdResponse> => {
  try {
    if (!id) {
      return {
        success: false,
        status: 400,
        message: "Course ID is required",
      };
    }
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
    if (!course || !course.isPublished) {
      return {
        success: false,
        status: 404,
        message: "Course not found",
      };
    }
    return {
      success: true,
      status: 200,
      data: course,
    };
  } catch (error: unknown) {
    console.error("could not get course by id", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const updateCourse = async (
  id: string,
  data: unknown,
  userId: string,
  userRole: Role,
) => {
  try {
    const validatedData = courseSchema.partial().parse(data);

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found",
      };
    }

    if (userRole !== Role.ADMIN && course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "Unauthorized to update this course",
      };
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: validatedData,
    });

    return {
      success: true,
      status: 200,
      data: updatedCourse,
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error(
        "validation failed during course update",
        error.flatten().fieldErrors,
      );
      return {
        success: false,
        status: 400,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("error updating course data", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const deleteCourse = async (
  id: string,
  userId: string,
  userRole: Role,
) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });
    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found",
      };
    }

    if (userRole !== Role.ADMIN && course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
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
      status: 200,
      message: "Course deleted successfully",
    };
  } catch (error: unknown) {
    console.error("error during course deletion transaction", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type GetMyCoursesResponse =
  | {
      success: true;
      status: number;
      data: {
        courseId: string;
        title: string;
        thumbnail: string | null;
        totalLessons: number;
        completedLessons: number;
        progressPercentage: number;
      }[];
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const getMyCourses = async (
  userId: string,
): Promise<GetMyCoursesResponse> => {
  try {
    if (!userId) {
      return {
        success: false,
        status: 400,
        message: "User ID is required",
      };
    }
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            sections: {
              select: {
                lessons: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!enrollments.length) {
      return {
        success: true,
        status: 200,
        data: [],
      };
    }

    const allLessonIds = [
      ...new Set(
        enrollments.flatMap((enrollment) =>
          enrollment.course.sections.flatMap((section) =>
            section.lessons.map((lesson) => lesson.id),
          ),
        ),
      ),
    ];
    const progressRecords = await prisma.progress.findMany({
      where: {
        userId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
      select: {
        lessonId: true,
      },
    });
    const completedLessonIds = new Set(
      progressRecords.map((record) => record.lessonId),
    );

    const coursesData = enrollments.map((enrollment) => {
      const course = enrollment.course;
      const totalLessons = course.sections.reduce(
        (sum, section) => sum + section.lessons.length,
        0,
      );

      const completedLessons = course.sections.reduce(
        (sum, section) =>
          sum +
          section.lessons.reduce(
            (lessonSum, lesson) =>
              lessonSum + (completedLessonIds.has(lesson.id) ? 1 : 0),
            0,
          ),
        0,
      );
      const progressPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;
      return {
        courseId: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        totalLessons,
        completedLessons,
        progressPercentage,
      };
    });
    return {
      success: true,
      status: 200,
      data: coursesData,
    };
  } catch (error: unknown) {
    console.error("failed to fetch user courses and progress", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const toggleCoursePublishStatus = async (
  id: string,
  userId: string,
  userRole: Role,
) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        instructorId: true,
        isPublished: true,
        title: true,
        description: true,
        sections: {
          select: {
            id: true,
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return {
        success: false,
        status: 404,
        message: "course not found",
      };
    }

    if (userRole !== Role.ADMIN && course.instructorId !== userId) {
      return {
        success: false,
        status: 403,
        message: "unauthorized to change publish status",
      };
    }

    if (!course.isPublished) {
      const hasSections = course.sections.length > 0;
      const hasLessons = course.sections.some((s) => s.lessons.length > 0);

      if (!hasSections || !hasLessons) {
        return {
          success: false,
          status: 400,
          message:
            "cannot publish course without at least one section and one lesson",
        };
      }

      if (!course.title || !course.description) {
        return {
          success: false,
          status: 400,
          message: "course title and description are required for publishing",
        };
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: { isPublished: !course.isPublished },
    });

    return {
      success: true,
      status: 200,
      message: `course ${updatedCourse.isPublished ? "published" : "unpublished"} successfully`,
      data: {
        id: updatedCourse.id,
        isPublished: updatedCourse.isPublished,
      },
    };
  } catch (error: unknown) {
    console.error("failed to toggle course publish status", {
      error,
      courseId: id,
    });
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};
