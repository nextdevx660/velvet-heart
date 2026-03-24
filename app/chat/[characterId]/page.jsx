"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";

import ChatWindow from "@/components/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { useUsage } from "@/hooks/useUsage";
import { characterLibrary } from "@/lib/characters";
import { db } from "@/lib/firebase";

// This page loads one character, conversation history, and renders the chat UI.
export default function ChatPage() {
  const { characterId } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { plan, usageCount, loading: usageLoading } = useUsage(user);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const character = characterLibrary[characterId];

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !characterId) {
      return;
    }

    let mounted = true;

    // This function loads recent messages from the most recent conversation for this character.
    async function loadMessages() {
      try {
        const conversationQuery = query(
          collection(db, "conversations"),
          where("userId", "==", user.uid),
          where("characterId", "==", characterId),
          orderBy("createdAt", "desc"),
          limit(1),
        );

        const conversationSnapshot = await getDocs(conversationQuery);
        const conversationDoc = conversationSnapshot.docs[0];

        if (!conversationDoc) {
          if (mounted) {
            setConversationId(null);
            setMessages([]);
          }
          return;
        }

        const messageQuery = query(
          collection(db, "messages"),
          where("conversationId", "==", conversationDoc.id),
          orderBy("createdAt", "asc"),
          limit(20),
        );

        const messageSnapshot = await getDocs(messageQuery);
        const nextMessages = messageSnapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
          createdAt:
            docSnapshot.data().createdAt?.toDate?.()?.toISOString?.() ||
            new Date().toISOString(),
        }));

        if (mounted) {
          setConversationId(conversationDoc.id);
          setMessages(nextMessages);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [characterId, user]);

  useEffect(() => {
    if (!loading && !usageLoading && character && plan !== "pro" && !character.isFree) {
      router.replace("/pricing");
    }
  }, [character, loading, plan, router, usageLoading]);

  if (!character) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center text-slate-600">
        Character not found.
      </main>
    );
  }

  if (loading || usageLoading || !user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center text-slate-600">
        Loading chat...
      </main>
    );
  }

  if (plan !== "pro" && !character.isFree) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center text-slate-600">
        Redirecting to pricing...
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl md:py-10 sm:px-6 lg:px-8">
      <ChatWindow
        character={character}
        initialMessages={messages}
        initialConversationId={conversationId}
        plan={plan}
        usageCount={usageCount}
      />
    </main>
  );
}
