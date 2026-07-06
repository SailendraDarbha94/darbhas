"use client";

import { useState } from "react";
import { useSession } from "./session";

export function LoginForm() {
  const { signIn } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const message = await signIn(String(form.get("email")), String(form.get("password")));
    if (message) setError(message);
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f4ef] px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="font-[family-name:var(--font-serif)] text-2xl">Darbha Studio</h1>
        <p className="mt-1 text-sm text-[#7d7468]">Sign in to manage your writing.</p>

        <label className="mt-6 block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-black/15 px-4 py-2.5 outline-none focus:border-[#b0713b]"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-black/15 px-4 py-2.5 outline-none focus:border-[#b0713b]"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-[#b0713b] py-2.5 font-semibold text-white hover:bg-[#9a6233] disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
