import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Heart, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import { characterList } from "@/lib/characters";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f9fafb] text-[#1a1a1e] selection:bg-blue-100">
      {/* --- SOFT GRADIENT BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-rose-50/50 blur-[120px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 lg:pt-28">
        <div className="flex flex-col items-center text-center">
          {/* Subtle Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            AI Companionship Redefined
          </div>

          <h1 className="max-w-4xl font-sans text-5xl font-bold tracking-tight text-[#111827] sm:text-7xl">
            A cleaner way to connect <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              with your favorite AI.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Experience deep, meaningful conversations in a workspace designed for
            clarity. No noise, no distractions—just you and your companion.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group flex h-14 items-center justify-center rounded-2xl bg-[#111827] px-10 text-lg font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-blue-900/10 active:scale-95"
            >
              <p className="text-white">Get Started</p>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 text-white" />
            </Link>
            <Link
              href="/dashboard"
              className="flex h-14 items-center justify-center rounded-2xl border border-black/[0.08] bg-white/80 px-10 text-lg font-semibold backdrop-blur-md transition-all hover:bg-white hover:border-black/20"
            >
              Explore Gallery
            </Link>
          </div>
        </div>

        {/* --- CHARACTER GRID (Responsive & Interactive) --- */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {characterList.slice(0, 4).map((character) => (
            <div
              key={character.id}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-black/[0.05] bg-white p-3 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100">
                <Image
                  src={character.avatarUrl}
                  alt={character.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Floating Meta Tag */}
                <div className="absolute top-4 left-4">
                  <span className="rounded-xl bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-slate-700 shadow-sm border border-black/[0.03]">
                    {character.tag}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {character.name}
                  </h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {character.description || "Click to start a conversation and explore their story."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- FEATURE SECTION (Minimalist Cards) --- */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Heart className="text-blue-500" />}
            title="Persistent Memory"
            desc="Your companion remembers your name, your preferences, and your past chats."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-green-500" />}
            title="Privacy First"
            desc="Encrypted chats that belong to you. We never share your personal data."
          />
          <FeatureCard
            icon={<Crown className="text-amber-500" />}
            title="Pro Features"
            desc="Unlimited messaging, custom voices, and early access to new models."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-[2.5rem] border border-black/[0.03] bg-white/50 p-10 backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3f4f6]">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h4>
      <p className="mt-3 leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}