"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Application, Work } from "@darbha/types";
import { adminApi } from "@/lib/api";
import { useSession } from "./session";

export default function AdminOverview() {
  const { token } = useSession();
  const [pending, setPending] = useState<Application[] | null>(null);
  const [works, setWorks] = useState<Work[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminApi
      .listApplications(token, "pending")
      .then(setPending)
      .catch(() => setIsAdmin(false));
    adminApi
      .listWorks(token)
      .then(setWorks)
      .catch(() => setWorks([]));
  }, [token]);

  const drafts = works?.filter((w) => !w.published).length ?? 0;
  const published = works?.filter((w) => w.published).length ?? 0;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-serif)] text-3xl">Overview</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <Link
          href="/admin/works"
          className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="text-3xl font-semibold">{published}</div>
          <div className="mt-1 text-sm text-[#7d7468]">published works</div>
        </Link>
        <Link
          href="/admin/works"
          className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="text-3xl font-semibold">{drafts}</div>
          <div className="mt-1 text-sm text-[#7d7468]">drafts</div>
        </Link>
        {isAdmin ? (
          <Link
            href="/admin/applications"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="text-3xl font-semibold">{pending?.length ?? "–"}</div>
            <div className="mt-1 text-sm text-[#7d7468]">pending applications</div>
          </Link>
        ) : null}
      </div>

      <div className="mt-10">
        <Link
          href="/admin/works/new"
          className="inline-block rounded-lg bg-[#b0713b] px-5 py-2.5 font-semibold text-white hover:bg-[#9a6233]"
        >
          Write something new
        </Link>
      </div>
    </div>
  );
}
