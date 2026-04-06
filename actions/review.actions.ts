import { prisma } from "@/lib/prisma";
import { ReviewSchema, UpdateReviewSchema } from "@/schemas/review.schema";
import { Prisma, Role } from "@prisma/client";
import { canAccessCourse } from "@/actions/enrollment.actions";

type CreateReviewResponse =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        id: string;
        rating: number;
        comment: string | null;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const createReview = async (
  courseId: string,
  userId: string,
  role: Role,
  body: unknown,
): Promise<CreateReviewResponse> => {
  try {
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message || "Invalid review data",
      };
    }

    const { rating, comment } = parsed.data;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
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
        message: "You must be enrolled to review this course",
      };
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingReview) {
      return {
        success: false,
        status: 400,
        message: "You have already reviewed this course",
      };
    }

    const createdReview = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: { rating, comment, userId, courseId },
      });

      const stats = await tx.review.aggregate({
        where: { courseId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.course.update({
        where: { id: courseId },
        data: {
          averageRating: stats._avg.rating
            ? Number(stats._avg.rating.toFixed(1))
            : 0,
          totalReviews: stats._count.rating,
        },
      });
      return newReview;
    });

    return {
      success: true,
      status: 201,
      message: "Review created successfully",
      data: {
        id: createdReview.id,
        rating: createdReview.rating,
        comment: createdReview.comment,
      },
    };
  } catch (error: unknown) {
    console.error("failed to create review", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type GetCourseReviewsResponse =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        reviews: {
          id: string;
          rating: number;
          comment: string | null;
          createdAt: Date;
          user: {
            id: string;
            name: string | null;
            avatarUrl: string | null;
          };
        }[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }
  | {
      success: false;
      status: number;
      message: string;
    };

type SortOption = "latest" | "highest" | "lowest";

export const getCourseReviews = async (
  courseId: string,
  query: {
    page?: number;
    limit?: number;
    sort?: string;
  },
): Promise<GetCourseReviewsResponse> => {
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
      select: { id: true },
    });
    if (!course) {
      return {
        success: false,
        status: 404,
        message: "Course not found",
      };
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(Math.max(1, Number(query.limit) || 10), 50);

    const sort: SortOption =
      query.sort === "highest" || query.sort === "lowest"
        ? (query.sort as SortOption)
        : "latest";

    const skip = (page - 1) * limit;

    let orderBy: Prisma.ReviewOrderByWithRelationInput;

    switch (sort) {
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "latest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { courseId },
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { courseId } }),
    ]);

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        id: review.user.id,
        name: review.user.name,
        avatarUrl: review.user.avatarUrl,
      },
    }));

    return {
      success: true,
      status: 200,
      message: "Reviews fetched successfully",
      data: {
        reviews: formattedReviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: unknown) {
    console.error("error fetching course reviews", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type GetreviewSummaryResponse =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        averageRating: number;
        totalReviews: number;
        distribution: Record<number, number>;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
    };

export const getReviewSummary = async (
  courseId: string,
): Promise<GetreviewSummaryResponse> => {
  try {
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!courseExists) {
      return {
        success: false,
        status: 404,
        message: "Course not found",
      };
    }

    const [stats, distribution] = await Promise.all([
      prisma.review.aggregate({
        where: { courseId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.review.groupBy({
        where: { courseId },
        by: ["rating"],
        _count: { rating: true },
      }),
    ]);

    const formattedDistribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distribution.forEach((item) => {
      formattedDistribution[item.rating] = item._count.rating;
    });

    return {
      success: true,
      status: 200,
      message: "Review summary fetched successfully",
      data: {
        averageRating: stats._avg.rating
          ? Number(stats._avg.rating.toFixed(1))
          : 0,
        totalReviews: stats._count.rating,
        distribution: formattedDistribution,
      },
    };
  } catch (error: unknown) {
    console.error("failed to get review summary", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type UpdateReviewResponse =
  | {
      success: true;
      status: number;
      message: string;
      data: {
        id: string;
        rating: number;
        comment: string | null;
        updatedAt: Date;
      };
    }
  | {
      success: false;
      status: number;
      message: string;
      errors?: unknown[];
    };

export const updateReview = async (
  reviewId: string,
  userId: string,
  body: unknown,
): Promise<UpdateReviewResponse> => {
  try {
    const parsed = UpdateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return {
        success: false,
        status: 400,
        message: parsed.error.issues[0].message || "Invalid review data",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      };
    }

    const { rating, comment } = parsed.data;

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return {
        success: false,
        status: 404,
        message: "Review not found",
      };
    }

    if (existingReview.userId !== userId) {
      return {
        success: false,
        status: 403,
        message: "You can only update your own review",
      };
    }

    if (
      (rating === undefined || rating === existingReview.rating) &&
      (comment === undefined || comment === existingReview.comment)
    ) {
      return {
        success: false,
        status: 400,
        message: "No changes provided",
      };
    }

    const updatedReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: reviewId },
        data: {
          rating: rating ?? existingReview.rating,
          comment: comment ?? existingReview.comment,
        },
      });

      const stats = await tx.review.aggregate({
        where: { courseId: existingReview.courseId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.course.update({
        where: { id: existingReview.courseId },
        data: {
          averageRating: stats._avg.rating
            ? Number(stats._avg.rating.toFixed(1))
            : 0,
          totalReviews: stats._count.rating,
        },
      });
      return review;
    });

    return {
      success: true,
      status: 200,
      message: "Review updated successfully",
      data: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        updatedAt: updatedReview.updatedAt,
      },
    };
  } catch (error: unknown) {
    console.error("error while updating review", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};

type DeleteReviewResponse =
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

export const deleteReview = async (
  reviewId: string,
  userId: string,
): Promise<DeleteReviewResponse> => {
  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!existingReview) {
      return {
        success: false,
        status: 404,
        message: "Review not found",
      };
    }

    if (existingReview.userId !== userId) {
      return {
        success: false,
        status: 403,
        message: "You can only delete your own review",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      const stats = await tx.review.aggregate({
        where: { courseId: existingReview.courseId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.course.update({
        where: { id: existingReview.courseId },
        data: {
          averageRating: stats._avg.rating
            ? Number(stats._avg.rating.toFixed(1))
            : 0,
          totalReviews: stats._count.rating,
        },
      });
    });

    return {
      success: true,
      status: 200,
      message: "Review deleted successfully",
    };
  } catch (error: unknown) {
    console.error("failed to delete review from course", error);
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
    };
  }
};
