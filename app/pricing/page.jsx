"use client";

import { useState } from "react";
import { Check, Crown, Sparkles, Zap, ShieldCheck, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const pricingRows = [
  { label: "Messages per day", free: "20 messages", pro: "Unlimited", icon: Zap },
  { label: "Characters", free: "Starter Trio", pro: "Full Library", icon: Heart },
  { label: "Memory", free: "Short-term", pro: "Deep Memory", icon: ShieldCheck },
  { label: "Response Speed", free: "Standard", pro: "Instant Priority", icon: Sparkles },
];

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade() {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Checkout failed.");
      window.location.href = payload.data.url;
    } catch (nextError) {
      setError(nextError.message || "Unable to start checkout.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#f9fafb] selection:bg-indigo-100">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] h-[500px] w-[500px] rounded-full bg-indigo-50/50 blur-[100px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm ring-1 ring-black/[0.03]">
            <Crown className="h-3 w-3" />
            Pricing Plans
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Free to start, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Pro to stay close.
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-500">
            Enjoy a soulful experience without limits. Upgrade to unlock persistent
            memory and our entire character roster.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* PRO PLAN CARD */}
          <section className="relative overflow-hidden rounded-[2.5rem] border border-indigo-100 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
            <div className="absolute top-0 right-0 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                <Crown className="h-6 w-6" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-500">Most Popular</p>
              <h2 className="mt-2 text-5xl font-bold text-slate-900">$9<span className="text-xl font-medium text-slate-400">/mo</span></h2>

              <p className="mt-6 text-slate-600 leading-relaxed">
                Designed for those who want a deeper connection. Includes persistent
                long-term memory and priority access to new AI models.
              </p>

              <button
                type="button"
                onClick={handleUpgrade}
                disabled={loading}
                className="group mt-10 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 text-lg font-bold text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Preparing Checkout..." : "Upgrade to Pro"}
                <Zap className="h-4 w-4 fill-indigo-400 text-indigo-400 transition-transform group-hover:scale-125" />
              </button>

              {error && <p className="mt-4 text-center text-sm font-medium text-rose-500">{error}</p>}

              <p className="mt-6 text-center text-xs text-slate-400">
                Secure payment via Stripe. Cancel anytime.
              </p>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-[80px]" />
          </section>

          {/* FEATURE COMPARISON BENTO */}
          <section className="flex flex-col gap-4">
            {pricingRows.map((row) => (
              <div
                key={row.label}
                className="group flex flex-col gap-4 rounded-[2rem] border border-black/[0.03] bg-white/60 p-6 backdrop-blur-sm transition-all hover:bg-white hover:border-black/[0.08] sm:flex-row sm:items-center"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                  <row.icon className="h-5 w-5" />
                </div>

                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{row.label}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 sm:hidden">Free: {row.free}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-6 sm:mt-0">
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Free</p>
                      <p className="text-sm font-medium text-slate-500">{row.free}</p>
                    </div>

                    <div className="text-right border-l border-black/5 pl-6">
                      <p className="text-[10px] font-bold uppercase text-indigo-400 tracking-tighter">Pro</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                        <Check className="h-4 w-4" />
                        {row.pro}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200">
              <h4 className="text-lg font-bold">Special Offer</h4>
              <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
                Join 10,000+ users who have already found their perfect companion.
                Start your journey with our premium model today.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}