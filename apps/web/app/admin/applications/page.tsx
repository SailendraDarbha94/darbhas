"use client";

import { useCallback, useEffect, useState } from "react";
import type { Application } from "@darbha/types";
import { GENRE_LABELS } from "@darbha/ui";
import { adminApi } from "@/lib/api";
import { useSession } from "../session";
import { useToast } from "../toast";

export default function ApplicationsPage() {
  const { token } = useSession();
  const toast = useToast();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!token) return;
    adminApi
      .listApplications(token)
      .then(setApps)
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(refresh, [refresh]);

  async function review(app: Application, status: "approved" | "rejected") {
    if (!token) return;
    setBusyId(app.id);
    try {
      await adminApi.reviewApplication(token, app.id, status);
      if (status === "approved") {
        toast.success(`Approved — ${app.requestedSlug}.darbha.info is live`, {
          label: "Open →",
          href: `https://${app.requestedSlug}.darbha.info`,
        });
      } else {
        toast.success(`Rejected ${app.firstName} ${app.lastName}'s application`);
      }
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to review — try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="text-red-700">{error}</p>;
  if (!apps) return <p className="text-[#7d7468]">Loading&hellip;</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-serif)] text-3xl">Applications</h1>
      <div className="mt-8 space-y-4">
        {apps.length === 0 ? (
          <p className="text-[#7d7468]">No applications yet.</p>
        ) : (
          apps.map((app) => (
            <div key={app.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">
                  {app.firstName} {app.lastName}
                </span>
                <span className="text-sm text-[#7d7468]">{app.email}</span>
                <span className="rounded-full bg-[#b0713b]/10 px-3 py-0.5 text-xs font-semibold text-[#b0713b]">
                  {GENRE_LABELS[app.genre]}
                </span>
                <span
                  className={`ml-auto rounded-full px-3 py-0.5 text-xs font-semibold ${
                    app.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : app.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>
              <p className="mt-2 text-sm">
                wants <span className="font-mono font-medium">{app.requestedSlug}.darbha.info</span>
              </p>
              {app.message ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-[#7d7468]">{app.message}</p>
              ) : null}
              {app.status === "pending" ? (
                <div className="mt-4 flex gap-3">
                  <button
                    disabled={busyId === app.id}
                    onClick={() => void review(app, "approved")}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                  >
                    Approve &amp; create site
                  </button>
                  <button
                    disabled={busyId === app.id}
                    onClick={() => void review(app, "rejected")}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
