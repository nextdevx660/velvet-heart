import { NextResponse } from "next/server";

import { extractBearerToken } from "@/lib/utils";
import { adminAuth } from "@/lib/firebaseAdmin";
import { stripe } from "@/lib/stripeServer";

// This route creates a Stripe Checkout session for the authenticated user.
export async function POST(request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: "Stripe is not configured." },
        { status: 500 },
      );
    }

    if (!adminAuth) {
      return NextResponse.json(
        { success: false, error: "Firebase Admin is not configured." },
        { status: 500 },
      );
    }

    const token = extractBearerToken(request.headers.get("authorization") || "");

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: "STRIPE_PRICE_ID is missing." },
        { status: 500 },
      );
    }

    const origin =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: decodedToken.uid,
      customer_email: decodedToken.email,
      metadata: {
        uid: decodedToken.uid,
      },
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to create checkout session." },
      { status: 500 },
    );
  }
}
