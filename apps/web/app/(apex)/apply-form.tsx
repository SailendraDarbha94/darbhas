"use client";

import { useState } from "react";
import { WORK_TYPES } from "@darbha/types";
import { GENRE_LABELS } from "@darbha/ui";
import { ApiError, submitApplication } from "@/lib/api";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

const inputCls =
  "w-full rounded-lg border border-[#b0713b]/25 bg-white px-4 py-2.5 text-[#2b2620] outline-none transition focus:border-[#b0713b] focus:ring-2 focus:ring-[#b0713b]/20";

export function ApplyForm() {
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setState("submitting");

    const form = new FormData(event.currentTarget);
    try {
      await submitApplication({
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        requestedSlug: String(form.get("requestedSlug")).toLowerCase().trim(),
        email: String(form.get("email")),
        genre: String(form.get("genre")),
        message: String(form.get("message") || "") || undefined,
      });
      setState("done");
    } catch (e) {
      setState("idle");
      setError(e instanceof ApiError ? e.message : "Something went wrong — please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-[#3f6f4f]/30 bg-[#f2f5ef] p-6 text-[#26302a]">
        <p className="font-semibold">Application received.</p>
        <p className="mt-1 text-sm text-[#6d7a70]">
          We&apos;ll review it and get back to you by email. If approved, your site goes live at{" "}
          <span className="font-medium">{slug || "yourname"}.{SITE_DOMAIN}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">First name</span>
          <input name="firstName" required maxLength={60} className={inputCls} placeholder="Ananta" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Last name</span>
          <input
            name="lastName"
            required
            maxLength={60}
            className={inputCls}
            defaultValue="Darbha"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Your subdomain</span>
        <div className="flex items-center gap-2">
          <input
            name="requestedSlug"
            required
            pattern="[a-z][a-z0-9-]{1,30}"
            title="Lowercase letters, digits and hyphens; starts with a letter"
            className={inputCls}
            placeholder="ananta"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
          />
          <span className="whitespace-nowrap text-sm text-[#7d7468]">.{SITE_DOMAIN}</span>
        </div>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input name="email" type="email" required className={inputCls} placeholder="you@example.com" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">What do you write?</span>
        <select name="genre" required className={inputCls} defaultValue="poem">
          {WORK_TYPES.map((t) => (
            <option key={t} value={t}>
              {GENRE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Tell us about yourself <span className="font-normal text-[#7d7468]">(optional)</span>
        </span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          className={inputCls}
          placeholder="How you're related, what you write, a sample if you like..."
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-lg bg-[#b0713b] px-5 py-3 font-semibold text-white transition hover:bg-[#9a6233] disabled:opacity-60"
      >
        {state === "submitting" ? "Sending..." : "Apply for your subdomain"}
      </button>
    </form>
  );
}
