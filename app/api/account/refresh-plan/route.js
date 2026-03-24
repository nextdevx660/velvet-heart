import { NextResponse } from "next/server";

import { adminAuth } from "@/lib/firebaseAdmin";
import { syncUserPlanFromStripe } from "@/lib/stripeServer";
import { extractBearerToken } from "@/lib/utils";

export async function POST(request) {
  try {
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
    const result = await syncUserPlanFromStripe({
      uid: decodedToken.uid,
      email: decodedToken.email || "",
    });

    return NextResponse.json({
      success: true,
      data: {
        plan: result.plan,
        synced: result.synced,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to refresh plan." },
      { status: 500 },
    );
  }
}
