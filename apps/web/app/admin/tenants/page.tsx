"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tenant, TenantTheme } from "@darbha/types";
import { THEME_PRESETS } from "@darbha/types";
import { GENRE_LABELS, PALETTES } from "@darbha/ui";
import { adminApi } from "@/lib/api";
import { useSession } from "../session";
import { useToast } from "../toast";
import { toastInviteOutcome } from "../invite-toast";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

export default function TenantsPage() {
  const { token } = useSession();
  const toast = useToast();
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  // Per site, so one slow invite can't disable or close another site's form.
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!token) return;
    adminApi
      .listAllTenants(token)
      .then(setTenants)
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(refresh, [refresh]);

  async function setTheme(tenant: Tenant, preset: TenantTheme["preset"]) {
    if (!token) return;
    const theme = { ...(tenant.theme as TenantTheme), preset };
    try {
      await adminApi.updateTenant(token, tenant.id, { theme });
      toast.success(`Theme set to ${preset} for ${tenant.displayName}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change the theme — try again.");
    }
  }

  async function toggleStatus(tenant: Tenant) {
    if (!token) return;
    const next = tenant.status === "active" ? "hidden" : "active";
    try {
      await adminApi.updateTenant(token, tenant.id, { status: next });
      toast.success(
        next === "hidden"
          ? `${tenant.displayName} is now hidden from the gallery`
          : `${tenant.displayName} is visible again`,
      );
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not change visibility — try again.");
    }
  }

  async function sendInvite(tenant: Tenant, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    setInviteBusyId(tenant.id);
    try {
      const invite = await adminApi.inviteWriter(token, tenant.id, email);
      toastInviteOutcome(toast, email, invite);
      // Keep the form open when something needs a retry or a manual step, and
      // only ever close this site's form (another may be open by now).
      if ((invite.sent || invite.alreadyRegistered) && !invite.reason) {
        setInvitingId((cur) => (cur === tenant.id ? null : cur));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send the invite — try again.");
    } finally {
      setInviteBusyId((cur) => (cur === tenant.id ? null : cur));
    }
  }

  if (error) return <p className="text-red-700">{error} (admin access required)</p>;
  if (!tenants) return <p className="text-[#7d7468]">Loading&hellip;</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-serif)] text-3xl">Sites</h1>
      <div className="mt-8 space-y-4">
        {tenants.map((tenant) => {
          const theme = tenant.theme as TenantTheme;
          return (
            <div key={tenant.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">{tenant.displayName}</span>
                <a
                  href={`https://${tenant.slug}.${SITE_DOMAIN}`}
                  className="text-sm text-[#b0713b] hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {tenant.slug}.{SITE_DOMAIN}
                </a>
                <span className="rounded-full bg-[#b0713b]/10 px-3 py-0.5 text-xs font-semibold text-[#b0713b]">
                  {GENRE_LABELS[tenant.genre]}
                </span>
                <button
                  onClick={() => void toggleStatus(tenant)}
                  className={`ml-auto rounded-full px-3 py-0.5 text-xs font-semibold ${
                    tenant.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  title="Click to toggle visibility"
                >
                  {tenant.status}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-[#7d7468]">Theme:</span>
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => void setTheme(tenant, preset)}
                    title={preset}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      theme.preset === preset ? "border-[#2b2620]" : "border-transparent"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${PALETTES[preset].gradient[0]}, ${PALETTES[preset].gradient[1]})`,
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setInvitingId(invitingId === tenant.id ? null : tenant.id)}
                  aria-expanded={invitingId === tenant.id}
                  className="ml-auto rounded-lg border border-black/15 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
                >
                  Invite writer
                </button>
              </div>
              {invitingId === tenant.id ? (
                <form
                  onSubmit={(e) => void sendInvite(tenant, e)}
                  className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-4"
                >
                  <label htmlFor={`invite-${tenant.id}`} className="sr-only">
                    Writer&apos;s email
                  </label>
                  <input
                    id={`invite-${tenant.id}`}
                    name="email"
                    type="email"
                    required
                    autoFocus
                    placeholder="writer@example.com"
                    className="min-w-0 flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#b0713b]"
                  />
                  <button
                    type="submit"
                    disabled={inviteBusyId === tenant.id}
                    className="rounded-lg bg-[#b0713b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a6233] disabled:opacity-60"
                  >
                    {inviteBusyId === tenant.id ? "Sending…" : "Send invite"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvitingId(null)}
                    className="text-sm text-[#7d7468] hover:text-[#2b2620]"
                  >
                    Cancel
                  </button>
                  <p className="basis-full text-xs text-[#7d7468]">
                    They get an email to set their own password, and the login is linked to{" "}
                    {tenant.slug}.{SITE_DOMAIN}.
                  </p>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
