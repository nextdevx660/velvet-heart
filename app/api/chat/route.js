import { NextResponse } from "next/server";

import { characterLibrary } from "@/lib/characters";
import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { groq } from "@/lib/groq";
import { extractBearerToken, getTodayDateString, getUsageDocumentId } from "@/lib/utils";

const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";
const FREE_CONTEXT_LIMIT = 5;
const PRO_CONTEXT_LIMIT = 20;

// This function returns a verified Firebase uid from the Authorization header.
async function getAuthenticatedUid(request) {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not configured.");
  }

  const token = extractBearerToken(request.headers.get("authorization") || "");

  if (!token) {
    throw new Error("Missing authorization token.");
  }

  const decodedToken = await adminAuth.verifyIdToken(token);
  return decodedToken.uid;
}

// This function updates the long-term user memory for pro conversations.
async function updateConversationMemory(existingMemory, latestMessages) {
  if (!groq || !latestMessages.length) {
    return "";
  }

  const completion = await groq.chat.completions.create({
    model: GROQ_CHAT_MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You maintain a compact long-term memory for a roleplay chat. Keep only stable user facts and preferences that help remember the user later, such as their name, nickname, relationship details, likes, dislikes, goals, favorite topics, boundaries, and recurring personal details. Do not store temporary filler or the assistant's own details. Return plain text in 3 to 6 short lines.",
      },
      {
        role: "user",
        content: [
          `Existing memory:\n${existingMemory || "None yet."}`,
          "New conversation details:",
          latestMessages.map((message) => `${message.role}: ${message.content}`).join("\n"),
          "Rewrite the memory so it keeps old true facts and adds any new important ones.",
        ].join("\n\n"),
      },
    ],
  });

  return completion.choices?.[0]?.message?.content?.trim() || "";
}

// This route sends a user message to Groq, stores both sides, and tracks usage.
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: "Firebase Admin is not configured." },
        { status: 500 },
      );
    }

    if (!groq) {
      return NextResponse.json(
        { success: false, error: "Groq API is not configured." },
        { status: 500 },
      );
    }

    const uid = await getAuthenticatedUid(request);
    const body = await request.json();
    const { characterId, conversationId, message } = body;

    if (!characterId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "characterId and message are required." },
        { status: 400 },
      );
    }

    const character = characterLibrary[characterId];

    if (!character) {
      return NextResponse.json({ success: false, error: "Character not found." }, { status: 404 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data() || {};
    const plan = userData.plan || "free";
    const storedName =
      userData.username ||
      userData.displayName ||
      userData.name ||
      userData.email?.split("@")?.[0] ||
      "";

    if (plan !== "pro" && !character.isFree) {
      return NextResponse.json(
        { success: false, error: "Upgrade required for this character." },
        { status: 403 },
      );
    }

    const date = getTodayDateString();
    const usageRef = adminDb.collection("usage").doc(getUsageDocumentId(uid, date));
    const usageSnapshot = await usageRef.get();
    const currentUsage = usageSnapshot.data()?.count || 0;

    if (plan !== "pro" && currentUsage >= 20) {
      return NextResponse.json(
        { success: false, error: "Daily message limit reached. Upgrade to continue." },
        { status: 403 },
      );
    }

    let activeConversationId = conversationId;
    let conversationRef = activeConversationId
      ? adminDb.collection("conversations").doc(activeConversationId)
      : adminDb.collection("conversations").doc();

    if (!activeConversationId) {
      activeConversationId = conversationRef.id;
      await conversationRef.set({
        userId: uid,
        characterId,
        createdAt: adminTimestamp.serverTimestamp(),
        updatedAt: adminTimestamp.serverTimestamp(),
        memory: "",
      });
    }

    const conversationSnapshot = await conversationRef.get();
    const conversationData = conversationSnapshot.data() || {};
    const memory = conversationData.memory || "";
    const contextLimit = plan === "pro" ? PRO_CONTEXT_LIMIT : FREE_CONTEXT_LIMIT;

    const recentMessagesSnapshot = await adminDb
      .collection("messages")
      .where("conversationId", "==", activeConversationId)
      .orderBy("createdAt", "desc")
      .limit(contextLimit)
      .get();

    const recentMessages = recentMessagesSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .reverse();

    const userIdentityPrompt = storedName
      ? `The user's name is ${storedName}. Remember it and use it naturally from time to time.`
      : "";
    const systemPrompt = [character.prompt, userIdentityPrompt, memory ? `What you remember about this user: ${memory}` : ""]
      .filter(Boolean)
      .join("\n\n");

    const completion = await groq.chat.completions.create({
      model: GROQ_CHAT_MODEL,
      temperature: 0.85,
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages.map((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
        { role: "user", content: message.trim() },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("Groq did not return a reply.");
    }

    const userMessageRef = adminDb.collection("messages").doc();
    const assistantMessageRef = adminDb.collection("messages").doc();

    await userMessageRef.set({
      conversationId: activeConversationId,
      role: "user",
      content: message.trim(),
      createdAt: adminTimestamp.serverTimestamp(),
    });

    await assistantMessageRef.set({
      conversationId: activeConversationId,
      role: "assistant",
      content: reply,
      createdAt: adminTimestamp.serverTimestamp(),
    });

    await conversationRef.set(
      {
        updatedAt: adminTimestamp.serverTimestamp(),
      },
      { merge: true },
    );

    const nextUsage = currentUsage + 1;
    await usageRef.set(
      {
        userId: uid,
        date,
        count: nextUsage,
      },
      { merge: true },
    );

    const latestExchange = [
      ...recentMessages,
      { role: "user", content: message.trim() },
      { role: "assistant", content: reply },
    ];

    if (plan === "pro") {
      const summary = await updateConversationMemory(memory, latestExchange);

      if (summary) {
        await conversationRef.set(
          {
            memory: summary,
            updatedAt: adminTimestamp.serverTimestamp(),
          },
          { merge: true },
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reply,
        conversationId: activeConversationId,
        messagesUsed: nextUsage,
        limit: plan === "pro" ? null : 20,
        userMessage: {
          id: userMessageRef.id,
          role: "user",
          content: message.trim(),
          createdAt: new Date().toISOString(),
        },
        assistantMessage: {
          id: assistantMessageRef.id,
          role: "assistant",
          content: reply,
          createdAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Unable to process chat message." },
      { status: 500 },
    );
  }
}
