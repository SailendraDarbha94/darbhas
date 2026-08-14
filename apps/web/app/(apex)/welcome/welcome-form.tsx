"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

interface FieldErrors {
  next?: string;
  confirm?: string;
}

/**
 * Lands at the end of a Supabase invite link: the client absorbs the session
 * from the URL, then the new writer picks their password here. Without a
 * session (direct visit, expired link) we point them at the login instead.
 */
export function WelcomeForm() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    // The invite token in the URL hash is processed asynchronously on load,
    // so watch auth state rather than checking once.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = String(form.get("next") || "");
    const confirm = String(form.get("confirm") || "");

    const fieldErrors: FieldErrors = {};
    if (next.length < 8) fieldErrors.next = "Use at least 8 characters.";
    if (confirm !== next) fieldErrors.confirm = "Passwords don't match.";
    setErrors(fieldErrors);
    setFormError(null);
    if (Object.keys(fieldErrors).length > 0) return;

    setState("saving");
    const { error } = await getSupabase().auth.updateUser({ password: next });
    if (error) {
      setFormError(error.message);
      setState("idle");
      return;
    }
    setState("done");
  }

  if (checking) {
    return <p className="text-sm text-[#7d7468]">Checking your invitation&hellip;</p>;
  }

  if (!session) {
    return (
      <div>
        <p className="font-semibold">This page is reached from an invite email.</p>
        <p className="mt-1 text-sm text-[#7d7468]">
          The link may have expired, or you already have a login. Sign in at{" "}
          <a href="/admin" className="text-[#b0713b] hover:underline">
            the writer studio
          </a>{" "}
          — or ask the family admin for a fresh invite.
        </p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div>
        <p className="font-semibold">You&apos;re all set.</p>
        <p className="mt-1 text-sm text-[#6d7a70]">
          Your password is saved. Head to{" "}
          <a href="/admin" className="text-[#b0713b] hover:underline">
            your writer studio
          </a>{" "}
          to set up your site and publish your first work.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <p className="text-sm text-[#7d7468]">
        Signed in as <span className="font-medium text-[#2b2620]">{session.user.email}</span>
      </p>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input
          name="next"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="glass-input"
          aria-invalid={!!errors.next}
          aria-describedby={errors.next ? "next-error" : undefined}
        />
        {errors.next ? (
          <p id="next-error" role="alert" className="mt-1 text-sm text-red-700">
            {errors.next}
          </p>
        ) : null}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="glass-input"
          aria-invalid={!!errors.confirm}
          aria-describedby={errors.confirm ? "confirm-error" : undefined}
        />
        {errors.confirm ? (
          <p id="confirm-error" role="alert" className="mt-1 text-sm text-red-700">
            {errors.confirm}
          </p>
        ) : null}
      </label>

      {formError ? (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <button type="submit" disabled={state === "saving"} className="glass-btn">
        {state === "saving" ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
