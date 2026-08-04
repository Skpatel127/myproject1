"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm rounded-card border border-line bg-surface p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-muted">
            We sent a confirmation link to <strong>{email}</strong>. Confirm your
            address, then{" "}
            <Link href="/login" className="text-brand hover:underline">
              sign in
            </Link>
            .
          </p>
          <p className="mt-4 text-xs text-muted">
            New accounts default to the <strong>employee</strong> role. To become
            Owner, open Supabase → Table Editor → profiles and change your role.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Set up access to Agency OS.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-card border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          {error ? <p className="text-sm text-status-risk">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
