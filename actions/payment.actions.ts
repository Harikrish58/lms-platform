import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Creates a Stripe checkout session for a course purchase.
 *
 * Handles:
 * - Course availability validation
 * - Duplicate enrollment prevention
 * - Free course enrollment
 * - Pending payment prevention
 * - Stripe checkout session creation
 * - Payment record creation
 */
export const createCheckoutSession = async (
  courseId: string,
  userId: string,
) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        isPublished: true,
      },
    });

    if (!course || !course.isPublished) {
      return {
        success: false,
        message: "Course not available",
        status: 400,
      };
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        userId: true,
      },
    });

    if (existingEnrollment) {
      return {
        success: false,
        message: "Already enrolled",
        status: 400,
      };
    }

    if (course.price === 0) {
      await prisma.enrollment.create({
        data: {
          userId,
          courseId,
        },
      });

      return {
        success: true,
        data: {
          free: true,
        },
      };
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        courseId,
        status: "PENDING",
      },
      select: {
        id: true,
      },
    });

    if (existingPayment) {
      return {
        success: false,
        message: "Payment already in progress",
        status: 400,
      };
    }

    const amountInCents = Math.round(course.price * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: course.title,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`,
      metadata: {
        courseId,
        userId,
      },
    });

    if (!session.url) {
      return {
        success: false,
        message: "Failed to create checkout session",
        status: 500,
      };
    }

    await prisma.payment.create({
      data: {
        userId,
        courseId,
        stripeSessionId: session.id,
        amount: amountInCents,
        currency: "pln",
        status: "PENDING",
      },
    });

    return {
      success: true,
      data: {
        url: session.url,
      },
    };
  } catch (error: unknown) {
    console.error(
      `Failed to create checkout session for user ${userId} and course ${courseId}`,
      error,
    );

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
};