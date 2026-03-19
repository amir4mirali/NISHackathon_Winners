"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = (await response.json()) as { error?: string };
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Registration failed");
      return;
    }

    router.push("/platform");
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg">
        <h1 className="text-2xl font-bold">Create Resident Account</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Registration creates a resident account and signs you in automatically.
        </p>
      </header>

      <section className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow">
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="mt-4 flex gap-2">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Already have account? Login
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
