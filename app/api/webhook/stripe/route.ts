import Stripe from "stripe";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * POST /api/webhook/stripe
 * Handle Stripe webhook events.
 */
export async function POST(request: Request) {
  const body = await request.text();

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing signature",
      },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: unknown) {
    console.error("[Stripe Webhook Verification Error]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid signature",
      },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;

    if (!courseId || !userId) {
      console.error("[Stripe Webhook Error] Missing session metadata");

      return NextResponse.json(
        {
          received: true,
        },
        { status: 200 },
      );
    }

    try {
      await prisma.payment.update({
        where: {
          stripeSessionId: session.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId,
            courseId,
          },
        });
      }
    } catch (error: unknown) {
      console.error("[Stripe Webhook Processing Error]", error);
    }
  }

  return NextResponse.json(
    {
      received: true,
    },
    { status: 200 },
  );
}