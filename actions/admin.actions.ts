"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const getAdminAnalytics = async () => {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    completedEnrollments,
    totalReviews,
    revenueAggregate,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        role: "STUDENT",
      },
    }),

    prisma.user.count({
      where: {
        role: "INSTRUCTOR",
      },
    }),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    prisma.course.count(),

    prisma.course.count({
      where: {
        isPublished: true,
      },
    }),

    prisma.enrollment.count(),

    prisma.enrollment.count({
      where: {
        isComplete: true,
      },
    }),

    prisma.review.count(),

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "COMPLETED",
      },
    }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,

    totalCourses,
    publishedCourses,
    draftCourses: totalCourses - publishedCourses,

    totalEnrollments,
    completedEnrollments,

    totalReviews,

    totalRevenue: (revenueAggregate._sum.amount ?? 0) / 100,
  };
};

type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
};

export const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
}: GetUsersParams = {}) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),

    ...(role && {
      role,
    }),
  };

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,

    pagination: {
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

export const changeUserRole = async (
  userId: string,
  role: Role,
  adminId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.id === adminId) {
    throw new Error("You cannot change your own role");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return updatedUser;
};

export const toggleUserStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: !user.isActive,
    },
    select: {
      id: true,
      isActive: true,
    },
  });
};

export const deleteUser = async (userId: string, currentAdminId: string) => {
  if (userId === currentAdminId) {
    throw new Error("You cannot delete your own account");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === Role.ADMIN) {
    const adminCount = await prisma.user.count({
      where: {
        role: Role.ADMIN,
      },
    });

    if (adminCount <= 1) {
      throw new Error("Cannot delete the last admin account");
    }
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    success: true,
  };
};

export const getCourses = async ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            instructor: {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }
    : {};

  const [courses, totalCourses] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.course.count({
      where,
    }),
  ]);

  return {
    courses,

    pagination: {
      page,
      limit,
      totalCourses,
      totalPages: Math.ceil(totalCourses / limit),
    },
  };
};

export const toggleCoursePublishStatus = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      isPublished: true,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  return prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      isPublished: !course.isPublished,
    },
    select: {
      id: true,
      title: true,
      isPublished: true,
    },
  });
};

export const deleteCourse = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  await prisma.$transaction(async (tx) => {
    const sections = await tx.section.findMany({
      where: { courseId: courseId },
      select: { id: true },
    });

    const sectionIds = sections.map((section) => section.id);

    const lessons = await tx.lesson.findMany({
      where: {
        sectionId: {
          in: sectionIds,
        },
      },
      select: {
        id: true,
      },
    });

    const lessonIds = lessons.map((lesson) => lesson.id);

    if (lessonIds.length > 0) {
      await tx.progress.deleteMany({
        where: {
          lessonId: {
            in: lessonIds,
          },
        },
      });
    }

    if (sectionIds.length > 0) {
      await tx.lesson.deleteMany({
        where: {
          sectionId: {
            in: sectionIds,
          },
        },
      });
    }

    await tx.section.deleteMany({
      where: {
        courseId: courseId,
      },
    });

    await tx.enrollment.deleteMany({
      where: {
        courseId: courseId,
      },
    });

    await tx.review.deleteMany({
      where: {
        courseId: courseId,
      },
    });

    await tx.payment.deleteMany({
      where: {
        courseId: courseId,
      },
    });

    await tx.course.delete({
      where: {
        id: courseId,
      },
    });
  });

  return {
    success: true,
  };
};

export const getReviews = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  const skip = (page - 1) * limit;

  const [reviews, totalReviews] = await Promise.all([
    prisma.review.findMany({
      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),

    prisma.review.count(),
  ]);

  return {
    reviews,

    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
  };
};

export const deleteReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return {
    success: true,
  };
};

export const getInstructors = async ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  const skip = (page - 1) * limit;

  const where = {
    role: Role.INSTRUCTOR,

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [instructors, totalInstructors] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        headline: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    instructors,

    pagination: {
      page,
      limit,
      totalInstructors,
      totalPages: Math.ceil(totalInstructors / limit),
    },
  };
};
