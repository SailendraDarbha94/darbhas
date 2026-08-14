"use client";

import { useState } from "react";
import { isAuthApiError } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { useSession } from "../session";
import { useToast } from "../toast";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 outline-none focus:border-[#b0713b]";

interface FieldErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

export default function SettingsPage() {
  const { session } = useSession();
  const toast = useToast();
  const email = session?.user.email ?? "";

  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const current = String(form.get("current") || "");
    const next = String(form.get("next") || "");
    const confirm = String(form.get("confirm") || "");

    const fieldErrors: FieldErrors = {};
    if (next.length < 8) fieldErrors.next = "Use at least 8 characters.";
    if (confirm !== next) fieldErrors.confirm = "Passwords don't match.";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setBusy(true);
    const supabase = getSupabase();

    // Verify the current password before changing anything — protects an
    // unattended logged-in session on a shared family computer.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (verifyError) {
      // Only a real credential failure blames the password — rate limits and
      // network drops would otherwise masquerade as "wrong password".
      if (isAuthApiError(verifyError) && verifyError.code === "invalid_credentials") {
        setErrors({ current: "That doesn't match your current password." });
      } else {
        toast.error("Couldn't verify your password right now — try again in a moment.");
      }
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      if (
        isAuthApiError(error) &&
        (error.code === "same_password" || error.code === "weak_password")
      ) {
        setErrors({ next: error.message });
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Password changed");
      formEl.reset();
    }
    setBusy(false);
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-serif)] text-3xl">Settings</h1>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b0713b]">
            Account
          </h2>
          <p className="mt-3 text-sm text-[#7d7468]">
            Signed in as <span className="font-medium text-[#2b2620]">{email}</span>
          </p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b0713b]">
            Change password
          </h2>
          <form onSubmit={(e) => void onChangePassword(e)} className="mt-4 max-w-sm space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Current password</span>
              <input
                name="current"
                type="password"
                required
                autoComplete="current-password"
                className={inputCls}
                aria-invalid={!!errors.current}
                aria-describedby={errors.current ? "current-error" : undefined}
              />
              {errors.current ? (
                <p id="current-error" role="alert" className="mt-1 text-sm text-red-700">
                  {errors.current}
                </p>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">New password</span>
              <input
                name="next"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputCls}
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
              <span className="mb-1 block text-sm font-medium">Confirm new password</span>
              <input
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
                className={inputCls}
                aria-invalid={!!errors.confirm}
                aria-describedby={errors.confirm ? "confirm-error" : undefined}
              />
              {errors.confirm ? (
                <p id="confirm-error" role="alert" className="mt-1 text-sm text-red-700">
                  {errors.confirm}
                </p>
              ) : null}
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#b0713b] px-5 py-2.5 font-semibold text-white hover:bg-[#9a6233] disabled:opacity-60"
            >
              {busy ? "Changing…" : "Change password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
