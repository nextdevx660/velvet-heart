"use client";

import { useEffect, useState } from "react";
import { MessageSquareQuote, ShieldCheck, Sparkles, Star } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";

const categoryCopy = {
  idea: "What should we add next?",
  bug: "What feels broken or confusing?",
  review: "How does the app feel overall?",
};

function RatingStars({ rating, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className="transition-transform hover:scale-110"
          aria-label={`Set rating to ${value}`}
        >
          <Star
            className={`h-6 w-6 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "idea",
    rating: 5,
    message: "",
  });

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        name: current.name || user.displayName || "",
        email: current.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function loadFeedback() {
      try {
        const response = await fetch("/api/feedback");
        const payload = await response.json();

        if (mounted && response.ok && payload.success) {
          setEntries(payload.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoadingEntries(false);
        }
      }
    }

    loadFeedback();

    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (user) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to submit feedback.");
      }

      setEntries((current) => [payload.data, ...current].slice(0, 12));
      setForm((current) => ({
        ...current,
        category: "idea",
        rating: 5,
        message: "",
      }));
      toast.success("Feedback submitted.");
    } catch (error) {
      toast.error(error.message || "Unable to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f2] text-slate-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[-5%] top-[8%] h-[420px] w-[420px] rounded-full bg-amber-100/60 blur-[110px]" />
        <div className="absolute bottom-[0%] right-[-5%] h-[480px] w-[480px] rounded-full bg-emerald-100/60 blur-[120px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              Community Feedback
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Tell me what this app still needs before launch.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Share features, bug reports, rough edges, or a blunt review. This page is meant to
              collect real opinions before deployment.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[2rem] border border-black/[0.04] bg-white/75 p-5">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 text-sm font-bold text-slate-900">Feature Requests</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Collect what users want next.</p>
              </div>
              <div className="rounded-[2rem] border border-black/[0.04] bg-white/75 p-5">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <p className="mt-3 text-sm font-bold text-slate-900">Bug Reports</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Catch blockers before release.</p>
              </div>
              <div className="rounded-[2rem] border border-black/[0.04] bg-white/75 p-5">
                <Star className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-sm font-bold text-slate-900">Reviews</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Understand how the app feels.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-black/[0.05] bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Submit Feedback</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-black/5 bg-[#fafaf8] px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email optional"
                  className="w-full rounded-2xl border border-black/5 bg-[#fafaf8] px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-black/5 bg-[#fafaf8] px-4 py-3 text-sm outline-none"
                >
                  <option value="idea">Feature idea</option>
                  <option value="bug">Bug report</option>
                  <option value="review">Review</option>
                </select>
                <div className="rounded-2xl border border-black/5 bg-[#fafaf8] px-4 py-3">
                  <RatingStars
                    rating={form.rating}
                    onChange={(rating) => setForm((current) => ({ ...current, rating }))}
                  />
                </div>
              </div>

              <p className="text-sm text-slate-500">{categoryCopy[form.category]}</p>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Be specific. What should change, what feels missing, or what is already strong?"
                rows={6}
                className="w-full rounded-[1.75rem] border border-black/5 bg-[#fafaf8] px-4 py-4 text-sm leading-6 outline-none placeholder:text-slate-400"
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-[1.5rem] bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Send Feedback"}
              </button>
            </form>
          </div>
        </div>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Recent Posts</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">What people are saying</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {loadingEntries ? (
              <div className="rounded-[2rem] border border-black/[0.05] bg-white/70 p-6 text-sm text-slate-500">
                Loading feedback...
              </div>
            ) : entries.length ? (
              entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-[2rem] border border-black/[0.05] bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{entry.name || "Anonymous"}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        {entry.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={`${entry.id}-${index}`}
                          className={`h-4 w-4 ${index < entry.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">{entry.message}</p>
                  <p className="mt-5 text-xs text-slate-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[2rem] border border-black/[0.05] bg-white/70 p-6 text-sm text-slate-500">
                No feedback yet. The first opinion sets the tone.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
