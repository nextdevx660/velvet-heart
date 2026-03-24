import { NextResponse } from "next/server";

import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { extractBearerToken } from "@/lib/utils";

async function getOptionalUser(request) {
  if (!adminAuth) {
    return null;
  }

  const token = extractBearerToken(request.headers.get("authorization") || "");

  if (!token) {
    return null;
  }

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: true, data: [] });
    }

    const snapshot = await adminDb.collection("feedback").orderBy("createdAt", "desc").limit(12).get();
    const data = snapshot.docs.map((doc) => {
      const entry = doc.data();

      return {
        id: doc.id,
        name: entry.name || "Anonymous",
        email: entry.email || "",
        category: entry.category || "idea",
        rating: entry.rating || 5,
        message: entry.message || "",
        createdAt:
          entry.createdAt?.toDate?.()?.toISOString?.() ||
          entry.createdAtIso ||
          new Date().toISOString(),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to load feedback." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: "Firebase Admin is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const authUser = await getOptionalUser(request);
    const name = body.name?.trim() || authUser?.name || "Anonymous";
    const email = body.email?.trim() || authUser?.email || "";
    const category = body.category?.trim() || "idea";
    const message = body.message?.trim() || "";
    const rating = Number(body.rating);

    if (!message || message.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter at least 10 characters of feedback." },
        { status: 400 },
      );
    }

    if (!["idea", "bug", "review"].includes(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid feedback category." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5." },
        { status: 400 },
      );
    }

    const createdAtIso = new Date().toISOString();
    const feedbackRef = adminDb.collection("feedback").doc();

    await feedbackRef.set({
      uid: authUser?.uid || null,
      name,
      email,
      category,
      rating,
      message,
      createdAt: adminTimestamp.serverTimestamp(),
      createdAtIso,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: feedbackRef.id,
        name,
        email,
        category,
        rating,
        message,
        createdAt: createdAtIso,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to submit feedback." },
      { status: 500 },
    );
  }
}
