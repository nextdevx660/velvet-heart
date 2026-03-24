import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebaseAdmin";
import { stripe } from "@/lib/stripeServer";

// This route verifies Stripe webhook events and upgrades users after payment success.
export async function POST(request) {
  try {
    if (!stripe || !adminDb) {
      return NextResponse.json(
        { success: false, error: "Stripe or Firebase Admin is not configured." },
        { status: 500 },
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, error: "STRIPE_WEBHOOK_SECRET is missing." },
        { status: 500 },
      );
    }

    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing webhook signature." },
        { status: 400 },
      );
    }

    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const uid = session.metadata?.uid || session.client_reference_id;

      if (uid) {
        await adminDb.collection("users").doc(uid).set(
          {
            email: session.customer_details?.email || null,
            plan: "pro",
            stripeCustomerId: session.customer || null,
            stripeSubscriptionId: session.subscription || null,
          },
          { merge: true },
        );
      }
    }

    return NextResponse.json({ success: true, data: { received: true } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to process webhook." },
      { status: 400 },
    );
  }
}
