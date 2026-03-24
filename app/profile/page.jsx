"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import {
  User as UserIcon,
  Mail,
  Crown,
  MessageSquare,
  Loader2,
  ShieldCheck,
  Settings
} from "lucide-react";

import UsageBanner from "@/components/UsageBanner";
import { useAuth } from "@/hooks/useAuth";
import { useUsage } from "@/hooks/useUsage";
import { db } from "@/lib/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { plan, usageCount, loading: usageLoading } = useUsage(user);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    async function loadProfile() {
      try {
        const profileSnapshot = await getDoc(doc(db, "users", user.uid));
        if (mounted) setProfile(profileSnapshot.data() || null);
      } catch (error) {
        console.error(error);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, [user]);

  if (loading || usageLoading || !user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Fetching your profile...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f9fafb] selection:bg-blue-100">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-blue-50/50 blur-[120px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* --- MAIN PROFILE CARD --- */}
          <section className="overflow-hidden rounded-[2.5rem] border border-black/[0.03] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              {/* Modern Avatar Placeholder */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white shadow-lg shadow-blue-200">
                {(profile?.username || user.displayName || user.email || "U")[0].toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {profile?.username || user.displayName || "User Account"}
                  </h1>
                  <Settings className="h-5 w-5 text-slate-300 hover:text-slate-600 cursor-pointer transition-colors" />
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
              </div>
            </header>

            {/* BENTO STATS GRID */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="group rounded-[2rem] border border-black/[0.03] bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Crown className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Membership</p>
                <p className="mt-1 text-2xl font-bold capitalize text-slate-900">{plan} Plan</p>
              </div>

              <div className="group rounded-[2rem] border border-black/[0.03] bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Today</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{usageCount} <span className="text-sm font-medium text-slate-400">Msgs</span></p>
              </div>
            </div>
          </section>

          {/* --- USAGE & PERKS SIDEBAR --- */}
          <section className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-[2.5rem] border border-black/[0.03] bg-white p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Usage Details
              </h3>
              <UsageBanner plan={plan} used={usageCount} />

              <div className="mt-8 rounded-2xl bg-blue-50/50 p-5 ring-1 ring-blue-500/10">
                <p className="text-[13px] leading-relaxed text-slate-600">
                  {plan === "pro"
                    ? "You have full access to all characters and unlimited memory. Your stories are preserved forever."
                    : "Free accounts are limited to 20 messages per day. Upgrade to Pro for unlimited access and deep memory."}
                </p>
              </div>
            </div>

            {/* Quick Action Link */}
            {plan !== "pro" && (
              <button
                onClick={() => router.push('/pricing')}
                className="group flex h-16 w-full items-center justify-between rounded-[2rem] bg-slate-900 px-8 text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="font-bold tracking-tight">Go Pro Membership</span>
                <Crown className="h-5 w-5 fill-amber-400 text-amber-400 transition-transform group-hover:rotate-12" />
              </button>
            )}
          </section>

        </div>
      </section>
    </main>
  );
}