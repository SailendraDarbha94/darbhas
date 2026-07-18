"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Work } from "@darbha/types";
import { adminApi } from "@/lib/api";
import { useSession } from "../session";
import { useToast } from "../toast";

type WorkRow = Work & { tenant?: { slug: string; displayName: string } };

export default function WorksPage() {
  const { token } = useSession();
  const toast = useToast();
  const [works, setWorks] = useState<WorkRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminApi
      .listWorks(token)
      .then(setWorks)
      .catch((e) => setError(e.message));
  }, [token]);

  async function onDelete(work: WorkRow) {
    if (!token || deletingId) return;
    if (!confirm(`Delete "${work.title}"? This cannot be undone.`)) return;
    setDeletingId(work.id);
    try {
      await adminApi.deleteWork(token, work.id);
      setWorks((prev) => prev?.filter((w) => w.id !== work.id) ?? prev);
      toast.success(`Deleted "${work.title}"`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete — try again.");
    } finally {
      setDeletingId(null);
    }
  }

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

      <div className="mt-8 rounded-2xl bg-white shadow-sm">
        {works.length === 0 ? (
          <p className="p-6 text-[#7d7468]">Nothing here yet — write your first piece.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/10 text-[#7d7468]">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6">Title</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Type</th>
                  <th className="hidden px-4 py-3 font-medium sm:px-6 md:table-cell">Tags</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell sm:px-6">Updated</th>
                  <th className="px-4 py-3 font-medium sm:px-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {works.map((work) => (
                  <tr key={work.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.02]">
                    <td className="px-4 py-3 sm:px-6">
                      <Link href={`/admin/works/${work.id}`} className="font-medium hover:text-[#b0713b]">
                        {work.title}
                      </Link>
                      {work.tenant ? (
                        <span className="ml-2 text-xs text-[#7d7468]">({work.tenant.slug})</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 sm:px-6">{work.type}</td>
                    <td className="hidden px-4 py-3 sm:px-6 md:table-cell">
                      {work.tags.length === 0 ? (
                        <span className="text-xs text-[#7d7468]">—</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {work.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#b0713b]/10 px-2 py-0.5 text-xs font-semibold text-[#b0713b]"
                            >
                              {tag}
                            </span>
                          ))}
                          {work.tags.length > 3 ? (
                            <span
                              className="text-xs text-[#7d7468]"
                              title={work.tags.slice(3).join(", ")}
                            >
                              +{work.tags.length - 3}
                            </span>
                          ) : null}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          work.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {work.published ? "published" : "draft"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-[#7d7468] sm:table-cell sm:px-6">
                      {new Date(work.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6">
                      <span className="inline-flex gap-2 whitespace-nowrap">
                        <Link
                          href={`/admin/works/${work.id}`}
                          className="rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold hover:bg-black/5"
                          title={`Edit "${work.title}"`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => void onDelete(work)}
                          disabled={deletingId !== null}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          title={`Delete "${work.title}"`}
                        >
                          {deletingId === work.id ? "Deleting…" : "Delete"}
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
