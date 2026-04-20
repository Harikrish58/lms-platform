import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { success: false, message: "Missing signature" },
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
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 400 },
    );
  }

  // Handle event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;

    if (!courseId || !userId) {
      console.error("Missing metadata in session");
      return NextResponse.json({ received: true });
    }

    try {
      // Mark payment as COMPLETED
      await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: { status: "COMPLETED" },
      });

      // Prevent double enrollment
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      // Enroll user
      if (!existing) {
        await prisma.enrollment.create({
          data: {
            userId,
            courseId,
          },
        });
      }

      console.log("Payment completed + user enrolled");
    } catch (error) {
      console.error("Error processing webhook:", error);
    }
  }

  return NextResponse.json({ received: true });
}
