import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

export async function GET(req: Request) {
  try {
    const auth = await authMiddleware();

    if (!auth.success) {
      return auth.error;
    }

    const instructorId = auth.user.id;

    // Fetch all courses for this instructor to aggregate data
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        payments: true,
        enrollments: true,
      },
    });

    const totalRevenue = courses.reduce(
      (acc, course) =>
        acc + course.payments.reduce((sum, p) => sum + p.amount, 0),
      0,
    );

    const totalEnrollments = courses.reduce(
      (acc, course) => acc + course.enrollments.length,
      0,
    );

    const coursesWithRatings = courses.filter((c) => c.averageRating > 0);
    const averageCourseRating =
      coursesWithRatings.length > 0
        ? coursesWithRatings.reduce((sum, c) => sum + c.averageRating, 0) /
          coursesWithRatings.length
        : 0;

    // Aggregate monthly revenue for the chart
    const revenueByMonth = courses
      .flatMap((c) => c.payments)
      .reduce((acc: Record<string, number>, payment) => {
        const date = new Date(payment.createdAt);
        const month = date.toLocaleString("default", { month: "short" });

        acc[month] = (acc[month] || 0) + Number(payment.amount);
        return acc;
      }, {});

    const revenueData = Object.entries(revenueByMonth).map(([name, total]) => ({
      name,
      total,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalEnrollments,
        averageCourseRating,
        revenueData,
      },
    });
  } catch (error) {
    console.error("Analytics aggregation error:", error);
    return NextResponse.json(
      { message: "Failed to aggregate instructor analytics" },
      { status: 500 },
    );
  }
}
