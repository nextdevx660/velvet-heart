"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

// This page signs a new user up and initializes their Firestore profile.
export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  // This function updates a single signup field.
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // This function creates a Firebase auth user and the matching Firestore document.
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);

      await updateProfile(credential.user, {
        displayName: form.username,
      });

      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        email: credential.user.email,
        username: form.username,
        plan: "free",
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (nextError) {
      setError(nextError.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 text-slate-900">
      <div className="app-card w-full max-w-md rounded-[2rem] p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Signup</p>
        <h1 className="mt-3 font-serif text-4xl">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Start on the free plan with three characters and daily message limits.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400"
            required
          />
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
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#2f6fed]">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
