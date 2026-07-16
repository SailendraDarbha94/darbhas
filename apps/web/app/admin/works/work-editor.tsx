"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Tenant, Work, WorkType } from "@darbha/types";
import { WORK_TYPES } from "@darbha/types";
import { GENRE_LABELS } from "@darbha/ui";
import { adminApi } from "@/lib/api";
import { uploadMedia } from "@/lib/supabase";
import { useSession } from "../session";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 outline-none focus:border-[#b0713b]";

export function WorkEditor({ work }: { work?: Work }) {
  const { token, me } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(work?.coverUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const publishIntent = useRef(work?.published ?? false);

  // Admins must pick which writer a new work belongs to (writers are scoped
  // server-side, so they never see the picker).
  const isAdmin = me?.role === "admin";
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  useEffect(() => {
    if (!token || !isAdmin) return;
    adminApi
      .listAllTenants(token)
      .then(setTenants)
      .catch(() => {
        setError("Could not load the list of writers — reload and try again.");
      });
  }, [token, isAdmin]);

  async function onCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setCoverUrl(await uploadMedia(file, "covers"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const publish = publishIntent.current;
    if (!token) return;
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      // Only present in create mode for admins (the picker enforces a choice).
      tenantId: form.get("tenantId") ? String(form.get("tenantId")) : undefined,
      title: String(form.get("title")),
      type: String(form.get("type")) as WorkType,
      lang: String(form.get("lang") || "en"),
      excerpt: String(form.get("excerpt") || "") || undefined,
      body: String(form.get("body") || ""),
      tags: String(form.get("tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverUrl: coverUrl ?? undefined,
      published: publish,
    };

    try {
      if (work) {
        await adminApi.updateWork(token, work.id, payload);
      } else {
        await adminApi.createWork(token, payload);
      }
      router.push("/admin/works");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!work || !token) return;
    if (!confirm(`Delete "${work.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await adminApi.deleteWork(token, work.id);
      router.push("/admin/works");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void save(e)} className="space-y-5">
      {tenants && !work ? (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Writer</span>
          <select name="tenantId" required defaultValue="" className={inputCls}>
            <option value="" disabled>
              Whose site does this belong to?
            </option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.displayName} ({t.slug}.darbha.info)
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {tenants && work ? (
        <p className="text-sm text-[#7d7468]">
          Writer:{" "}
          <span className="font-medium text-[#2b2620]">
            {tenants.find((t) => t.id === work.tenantId)?.displayName ?? work.tenantId}
          </span>
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Title</span>
        <input name="title" required maxLength={200} defaultValue={work?.title} className={inputCls} />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Type</span>
          <select name="type" defaultValue={work?.type ?? "poem"} className={inputCls}>
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>
                {GENRE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Language</span>
          <select name="lang" defaultValue={work?.lang ?? "en"} className={inputCls}>
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Tags <span className="font-normal text-[#7d7468]">(comma separated)</span>
          </span>
          <input name="tags" defaultValue={work?.tags.join(", ")} className={inputCls} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Excerpt <span className="font-normal text-[#7d7468]">(shown on cards)</span>
        </span>
        <input name="excerpt" maxLength={300} defaultValue={work?.excerpt ?? ""} className={inputCls} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Cover image</span>
        <input type="file" accept="image/*" onChange={(e) => void onCoverChange(e)} className="text-sm" />
        {uploading ? <p className="mt-1 text-sm text-[#7d7468]">Uploading&hellip;</p> : null}
        {coverUrl ? (
          <img src={coverUrl} alt="" className="mt-3 h-40 rounded-xl object-cover" />
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Body <span className="font-normal text-[#7d7468]">(Markdown)</span>
        </span>
        <textarea
          name="body"
          rows={18}
          defaultValue={work?.body}
          className={`${inputCls} font-mono text-sm leading-relaxed`}
          placeholder={"# Title\n\nWrite here..."}
        />
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || uploading}
          onClick={() => {
            publishIntent.current = false;
          }}
          className="rounded-lg border border-black/15 px-5 py-2.5 font-semibold hover:bg-black/5 disabled:opacity-60"
        >
          {work?.published ? "Unpublish & save draft" : "Save draft"}
        </button>
        <button
          type="submit"
          disabled={busy || uploading}
          onClick={() => {
            publishIntent.current = true;
          }}
          className="rounded-lg bg-[#b0713b] px-5 py-2.5 font-semibold text-white hover:bg-[#9a6233] disabled:opacity-60"
        >
          {work?.published ? "Save" : "Publish"}
        </button>
        {work ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onDelete()}
            className="ml-auto rounded-lg border border-red-300 px-5 py-2.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
