import { NextResponse } from "next/server";

import { characterList } from "@/lib/characters";
import { adminDb } from "@/lib/firebaseAdmin";

// This route returns the available character metadata.
export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: true, data: characterList });
    }

    const snapshot = await adminDb.collection("characters").get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, data: characterList });
    }

    const data = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to fetch characters." },
      { status: 500 },
    );
  }
}
