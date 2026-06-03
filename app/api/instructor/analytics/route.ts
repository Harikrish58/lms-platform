import { NextResponse } from "next/server";

import { authMiddleware } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/instructor/analytics
 * Get analytics for the authenticated instructor.
 */
export async function GET(_request: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const instructorId = auth.user.id;

    const courses = await prisma.course.findMany({
      where: {
        instructorId,
      },
      include: {
        payments: true,
        enrollments: true,
      },
    });

    const totalRevenue = courses.reduce(
      (courseTotal, course) =>
        courseTotal +
        course.payments.reduce(
          (paymentTotal, payment) => paymentTotal + Number(payment.amount),
          0,
        ),
      0,
    );

    const totalEnrollments = courses.reduce(
      (total, course) => total + course.enrollments.length,
      0,
    );

    const ratedCourses = courses.filter(
      (course) => course.averageRating > 0,
    );

    const averageCourseRating =
      ratedCourses.length > 0
        ? ratedCourses.reduce(
            (total, course) => total + course.averageRating,
            0,
          ) / ratedCourses.length
        : 0;

    const revenueByMonth = courses
      .flatMap((course) => course.payments)
      .reduce<Record<string, number>>((accumulator, payment) => {
        const month = new Date(payment.createdAt).toLocaleString(
          "default",
          {
            month: "short",
          },
        );

        accumulator[month] =
          (accumulator[month] || 0) + Number(payment.amount);

        return accumulator;
      }, {});

    const revenueData = Object.entries(revenueByMonth).map(
      ([name, total]) => ({
        name,
        total,
      }),
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalEnrollments,
        averageCourseRating,
        revenueData,
      },
    });
  } catch (error: unknown) {
    console.error("[Instructor Analytics GET Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to aggregate instructor analytics",
      },
      { status: 500 },
    );
  }
}