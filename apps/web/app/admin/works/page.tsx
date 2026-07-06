"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Work } from "@darbha/types";
import { adminApi } from "@/lib/api";
import { useSession } from "../session";

type WorkRow = Work & { tenant?: { slug: string; displayName: string } };

export default function WorksPage() {
  const { token } = useSession();
  const [works, setWorks] = useState<WorkRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminApi
      .listWorks(token)
      .then(setWorks)
      .catch((e) => setError(e.message));
  }, [token]);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!works) return <p className="text-[#7d7468]">Loading&hellip;</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl">Works</h1>
        <Link
          href="/admin/works/new"
          className="rounded-lg bg-[#b0713b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a6233]"
        >
          New work
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        {works.length === 0 ? (
          <p className="p-6 text-[#7d7468]">Nothing here yet — write your first piece.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-[#7d7468]">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr key={work.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                  <td className="px-6 py-3">
                    <Link href={`/admin/works/${work.id}`} className="font-medium hover:text-[#b0713b]">
                      {work.title}
                    </Link>
                    {work.tenant ? (
                      <span className="ml-2 text-xs text-[#7d7468]">({work.tenant.slug})</span>
                    ) : null}
                  </td>
                  <td className="px-6 py-3">{work.type}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        work.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {work.published ? "published" : "draft"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[#7d7468]">
                    {new Date(work.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
