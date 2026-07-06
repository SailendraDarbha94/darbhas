"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tenant, TenantTheme } from "@darbha/types";
import { THEME_PRESETS } from "@darbha/types";
import { GENRE_LABELS, PALETTES } from "@darbha/ui";
import { adminApi } from "@/lib/api";
import { useSession } from "../session";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

export default function TenantsPage() {
  const { token } = useSession();
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    await adminApi.updateTenant(token, tenant.id, { theme });
    refresh();
  }

  async function toggleStatus(tenant: Tenant) {
    if (!token) return;
    await adminApi.updateTenant(token, tenant.id, {
      status: tenant.status === "active" ? "hidden" : "active",
    });
    refresh();
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
              <div className="mt-4 flex items-center gap-2">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
