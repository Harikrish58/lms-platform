import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const createCheckoutSession = async (
  courseId: string,
  userId: string
) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      return {
        success: false,
        message: "Course not available",
        status: 400,
      };
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        message: "Already enrolled",
        status: 400,
      };
    }

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
            unit_amount: Math.round(course.price * 100),
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

    return {
      success: true,
      data: {
        url: session.url,
      },
    };
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
};