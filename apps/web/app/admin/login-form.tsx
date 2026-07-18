"use client";

import { useState } from "react";
import { useSession } from "./session";
import { useToast } from "./toast";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

// Absolute URL on purpose: on admin.darbha.info a relative "/" rewrites back
// into the admin, so home must be addressed by its full host.
const HOME_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3400" : `https://${SITE_DOMAIN}`;

export function LoginForm() {
  const { signIn } = useSession();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const message = await signIn(String(form.get("email")), String(form.get("password")));
    if (message) {
      toast.error(message);
    } else {
      toast.success("Signed in — welcome back.");
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f4ef] px-6">
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

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-[#b0713b] py-2.5 font-semibold text-white hover:bg-[#9a6233] disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <footer className="mt-8 text-center text-sm text-[#7d7468]">
        <span aria-hidden className="mr-2 text-[#b0713b]/60">&#10086;&#xfe0e;</span>
        <a href={HOME_URL} className="text-[#b0713b] hover:underline">
          Back to {SITE_DOMAIN}
        </a>
      </footer>
    </div>
  );
}
