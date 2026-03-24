"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, LayoutGrid, Loader2, Crown } from "lucide-react";

import CharacterCard from "@/components/CharacterCard";
import { useAuth } from "@/hooks/useAuth";
import { useUsage } from "@/hooks/useUsage";
import { characterList } from "@/lib/characters";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { plan, loading: usageLoading } = useUsage(user);
  const [characters, setCharacters] = useState(characterList);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    let mounted = true;
    async function loadCharacters() {
      try {
        const response = await fetch("/api/characters");
        const payload = await response.json();
        if (mounted && response.ok && payload.success) {
          setCharacters(payload.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadCharacters();
    return () => { mounted = false; };
  }, []);

  // --- REFINED LOADING STATE ---
  if (loading || usageLoading || !user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium tracking-wide">Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f9fafb]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[0%] h-[500px] w-[500px] rounded-full bg-blue-50/40 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Header Section */}
        <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-inset ring-blue-500/10">
              <LayoutGrid className="h-3 w-3" />
              Character Gallery
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">companion</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              {plan === "pro"
                ? "Welcome back, Pro member. Your full library is unlocked and ready."
                : "Select a starter character below, or upgrade to Pro to unlock the full roster."}
            </p>
          </div>

          {/* Plan Status Badge */}
          {plan !== "pro" && (
            <button
              onClick={() => router.push('/pricing')}
              className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.05] transition-all hover:shadow-md hover:ring-black/[0.1]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Crown className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-400 uppercase">Current Plan</p>
                <p className="text-sm font-bold text-slate-900">Free Tier</p>
              </div>
              <div className="ml-4 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                Upgrade
              </div>
            </button>
          )}
        </header>

        {/* --- GRID SECTION --- */}
        {/* Change grid-cols-2 to grid-cols-2, lg:grid-cols-4, and xl:grid-cols-5 */}
        <div className="mt-10 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              locked={plan !== "pro" && !character.isFree}
            />
          ))}
        </div>

        {/* --- BOTTOM CTA --- */}
        <footer className="mt-24 flex flex-col items-center justify-center rounded-[3rem] border border-black/[0.03] bg-white/50 p-12 text-center backdrop-blur-sm">
          <Sparkles className="h-8 w-8 text-blue-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Can't find who you're looking for?</h2>
          <p className="mt-2 text-slate-500">We add new personalities every week. Stay tuned.</p>
        </footer>
      </div>
    </main>
  );
}