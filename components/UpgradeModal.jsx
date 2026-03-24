"use client";

import { Crown, Sparkles, X } from "lucide-react";

// This component prompts free users to upgrade once they hit the usage limit.
export default function UpgradeModal({ open, onClose, onUpgrade, loading }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[2rem] border border-black/5 bg-[#faf8f4] p-6 text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Message limit reached
            </div>
            <h2 className="font-serif text-3xl">Upgrade to Pro</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Unlock every character, unlimited conversations, and memory-aware replies.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/5 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-black/5 bg-white p-4">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Crown className="h-4 w-4 text-amber-600" />
            Unlimited daily messages
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Sparkles className="h-4 w-4 text-[#2f6fed]" />
            Access to premium personalities and saved memory
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting..." : "Upgrade Now"}
        </button>
      </div>
    </div>
  );
}
