"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { LoaderCircle, SendHorizonal, Sparkles, User, Info, MessageSquare } from "lucide-react";
import Image from "next/image";

import MessageBubble from "@/components/MessageBubble";
import UpgradeModal from "@/components/UpgradeModal";
import UsageBanner from "@/components/UsageBanner";
import { useAuth } from "@/hooks/useAuth";

export default function ChatWindow({
  character,
  initialMessages = [],
  initialConversationId = null,
  plan = "free",
  usageCount = 0,
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [currentUsage, setCurrentUsage] = useState(usageCount);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setConversationId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    setCurrentUsage(usageCount);
  }, [usageCount]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sortedMessages = useMemo(
    () =>
      ([...messages]).sort(
        (first, second) =>
          new Date(first.createdAt || 0).getTime() - new Date(second.createdAt || 0).getTime()
      ),
    [messages]
  );

  async function handleUpgrade() {
    if (!user) return;
    setUpgradeLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error);
      window.location.href = payload.data.url;
    } catch (error) {
      console.error(error);
      setUpgradeLoading(false);
    }
  }

  async function handleSend(event) {
    event.preventDefault();
    if (!input.trim() || !user || sending) return;

    setSending(true);
    const optimisticMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);
    setInput("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterId: character.id,
          conversationId,
          message: optimisticMessage.content,
        }),
      });

      const payload = await response.json();

      if (response.status === 403) {
        setMessages((current) => current.filter((item) => item.id !== optimisticMessage.id));
        setShowUpgrade(true);
        return;
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to send message.");
      }

      setConversationId(payload.data.conversationId);
      setCurrentUsage(payload.data.messagesUsed ?? currentUsage);
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimisticMessage.id),
        payload.data.userMessage,
        payload.data.assistantMessage,
      ]);
    } catch (error) {
      console.error(error);
      setMessages((current) => current.filter((item) => item.id !== optimisticMessage.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={handleUpgrade}
        loading={upgradeLoading}
      />

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr] lg:h-[calc(100vh-120px)]">

        {/* --- LEFT SIDEBAR: CHARACTER INFO --- */}
        <aside className="hidden flex-col gap-6 lg:flex">
          <div className="overflow-hidden border border-black/[0.03] bg-white p-6 shadow-sm">
            <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={character.avatarUrl}
                alt={character.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                <Sparkles className="h-3 w-3" />
                {character.tag}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{character.name}</h1>
              <p className="text-sm leading-relaxed text-slate-500">{character.description}</p>
            </div>
          </div>

          <div className="border border-black/[0.03] bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <Info className="h-3.5 w-3.5" />
              Daily Limits
            </h3>
            <UsageBanner plan={plan} used={currentUsage} />
          </div>
        </aside>

        {/* --- MAIN CHAT SECTION --- */}
        <section className="flex flex-col overflow-hidden border border-black/[0.03] bg-white shadow-xl shadow-slate-200/50">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-black/[0.03] bg-white/80 px-8 py-5 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-black/[0.05] lg:hidden">
                <Image src={character.avatarUrl} alt={character.name} fill className="object-cover" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Chat with {character.name}</h2>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Online Now</span>
                </div>
              </div>
            </div>
          </header>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-6 overflow-y-auto bg-[#f9fafb] px-6 py-8 scroll-smooth"
          >
            {sortedMessages.length ? (
              sortedMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  avatarUrl={character.avatarUrl}
                />
              ))
            ) : (
              <div className="mx-auto max-w-md rounded-[2rem] border border-dashed border-slate-200 bg-white/50 p-10 text-center backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-600">
                  {character.name} is waiting. Start the conversation with a friendly "Hello"!
                </p>
              </div>
            )}

            {sending && (
              <div className="flex items-center gap-3 pl-2 text-xs font-bold uppercase tracking-widest text-blue-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {character.name} is typing...
              </div>
            )}
          </div>

          {/* Input Area */}
          <footer className="bg-white px-6 py-6 lg:px-8">
            <form onSubmit={handleSend} className="relative mx-auto max-w-4xl">
              <div className="group relative flex items-center rounded-[2rem] border border-black/[0.06] bg-slate-50 p-2 pl-6 transition-all focus-within:border-blue-500/50 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-500/5">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={`Message ${character.name}...`}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="flex h-12 items-center gap-2 rounded-[1.5rem] bg-slate-900 px-6 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 disabled:opacity-30 disabled:grayscale"
                >
                  <span className="hidden sm:inline">Send</span>
                  <SendHorizonal className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-center text-[10px] font-medium text-slate-400">
                Press Enter to send. {character.name} is an AI and can make mistakes.
              </p>
            </form>
          </footer>
        </section>
      </div>
    </>
  );
}
