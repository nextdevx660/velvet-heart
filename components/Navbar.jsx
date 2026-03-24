"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MessageCircleHeart, Sparkles } from "lucide-react";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Characters" },
  { href: "/feedback", label: "Feedback" },
  { href: "/pricing", label: "Pricing" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.03] bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <MessageCircleHeart className="h-5 w-5" />
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600/80">
              Velvet Hearts
            </span>
            <span className="font-sans text-lg font-bold tracking-tight text-slate-900">
              AI Companion
            </span>
          </div>
        </Link>

        {/* Floating Navigation Pill */}
        <nav className="hidden items-center gap-1 rounded-2xl border border-black/[0.05] bg-black/[0.03] p-1.5 backdrop-blur-md md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/[0.05]"
                    : "text-slate-500 hover:text-slate-900"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden flex-col items-end mr-2 sm:flex">
                <p className="text-xs font-bold text-slate-900 leading-none">Account</p>
                <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="group flex h-10 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 fill-white/20" />
              Enter Now
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
