"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

// This page renders the login form and signs users in with Firebase Auth.
export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  // This function updates a single form field in local state.
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // This function ensures a Firestore user document exists after login.
  async function ensureUserDocument(nextUser) {
    const userRef = doc(db, "users", nextUser.uid);
    const existingDoc = await getDoc(userRef);

    if (!existingDoc.exists()) {
      await setDoc(userRef, {
        uid: nextUser.uid,
        email: nextUser.email,
        username: nextUser.displayName || nextUser.email?.split("@")[0] || "user",
        plan: "free",
        createdAt: serverTimestamp(),
      });
    }
  }

  // This function signs the user in with email and password credentials.
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(auth, form.email, form.password);
      await ensureUserDocument(credential.user);
      router.push("/dashboard");
    } catch (nextError) {
      setError(nextError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  // This function signs the user in with the Google provider.
  async function handleGoogleLogin() {
    setSubmitting(true);
    setError("");

    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, googleProvider);
      await ensureUserDocument(credential.user);
      router.push("/dashboard");
    } catch (nextError) {
      setError(nextError.message || "Unable to sign in with Google.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 text-slate-900">
      <div className="app-card w-full max-w-md rounded-[2rem] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Login</p>
        <h1 className="mt-3 font-serif text-4xl">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in to continue your conversations and unlock your saved profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400"
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="mt-4 w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-[#2f6fed]">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
