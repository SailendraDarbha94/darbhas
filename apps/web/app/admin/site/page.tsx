"use client";

import { useEffect, useState } from "react";
import type { Tenant } from "@darbha/types";
import { adminApi } from "@/lib/api";
import { useSession } from "../session";
import { SiteEditor } from "./site-editor";

export default function MySitePage() {
  const { token, me } = useSession();
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = me?.role === "admin";

  useEffect(() => {
    if (!token || !isAdmin) return;
    adminApi
      .listAllTenants(token)
      .then((list) => {
        setTenants(list);
        setSelectedId((prev) => prev ?? list[0]?.id ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load sites"));
  }, [token, isAdmin]);

  if (!token || !me) {
    return <p className="text-[#7d7468]">Loading&hellip;</p>;
  }
  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  // Writers: their own site, no picker.
  if (!isAdmin) {
    if (!me.tenant) {
      return (
        <div>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl">My Site</h1>
          <p className="mt-4 max-w-lg text-[#7d7468]">
            Your account isn&apos;t linked to a site yet. Ask the family admin to connect your
            login to your subdomain, then this page becomes your editor.
          </p>
        </div>
      );
    }
    return (
      <div>
        <h1 className="font-[family-name:var(--font-serif)] text-3xl">My Site</h1>
        <p className="mt-1 text-sm text-[#7d7468]">{me.tenant.slug}.darbha.info</p>
        <div className="mt-8">
          <SiteEditor key={me.tenant.id} tenant={me.tenant} token={token} />
        </div>
      </div>
    );
  }

  // Admins: pick any site to curate (e.g. Baburao's memorial page).
  const selected = tenants?.find((t) => t.id === selectedId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl">Site profiles</h1>
        {tenants ? (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[#7d7468]">Editing:</span>
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-black/15 bg-white px-3 py-2 outline-none focus:border-[#b0713b]"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.displayName} ({t.slug})
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {!tenants ? (
        <p className="mt-8 text-[#7d7468]">Loading&hellip;</p>
      ) : selected ? (
        <div className="mt-8">
          <SiteEditor key={selected.id} tenant={selected} token={token} />
        </div>
      ) : (
        <p className="mt-8 text-[#7d7468]">No sites yet.</p>
      )}
    </div>
  );
}
