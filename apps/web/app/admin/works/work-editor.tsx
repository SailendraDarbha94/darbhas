"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Tenant, Work, WorkType } from "@darbha/types";
import { WORK_TYPES } from "@darbha/types";
import { GENRE_LABELS } from "@darbha/ui";
import { adminApi } from "@/lib/api";
import { uploadMedia } from "@/lib/supabase";
import { useSession } from "../session";
import { useToast } from "../toast";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 outline-none focus:border-[#b0713b]";

/** Only what the public pages actually style — core Markdown, no tables etc. */
const MARKDOWN_TIPS: { syntax: string; result: string }[] = [
  { syntax: "# Big heading", result: "a large section title" },
  { syntax: "## Heading", result: "a smaller section title" },
  { syntax: "*words*", result: "italic — nice for stage directions" },
  { syntax: "**words**", result: "bold" },
  { syntax: "(blank line)", result: "starts a new stanza or paragraph" },
  { syntax: "(single line break)", result: "kept as-is — write verse naturally" },
  { syntax: "> line", result: "an indented quote" },
  { syntax: "---", result: "a ❦ divider — needs a blank line above and below it" },
  { syntax: "- item", result: "a bulleted list" },
  { syntax: "[words](https://…)", result: "a link" },
  { syntax: "![](https://…)", result: "a picture from a URL" },
];

function MarkdownHelpButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      {...(open ? { "aria-controls": "markdown-help" } : {})}
      aria-label={open ? "Hide Markdown help" : "Show Markdown help"}
      title="Markdown help"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#b0713b]/40 text-[11px] font-semibold text-[#b0713b] hover:bg-[#b0713b]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b0713b]"
    >
      i
    </button>
  );
}

function MarkdownHelpPanel() {
  return (
    <div
      id="markdown-help"
      className="mb-2 rounded-xl border border-[#b0713b]/20 bg-[#faf7f0] p-4 text-sm"
    >
      <p className="mb-3 font-medium text-[#2b2620]">How formatting works</p>
      <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[max-content_1fr]">
        {MARKDOWN_TIPS.map((tip) => (
          <div key={tip.syntax} className="contents">
            <dt>
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-[#2b2620] ring-1 ring-black/10">
                {tip.syntax}
              </code>
            </dt>
            <dd className="pb-1 text-[#7d7468] sm:pb-0">{tip.result}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-[#7d7468]">
        That&apos;s the whole toolkit — anything fancier renders as plain text. Use Preview
        (next to Publish) to see it exactly as readers will.
      </p>
    </div>
  );
}

export function WorkEditor({ work }: { work?: Work }) {
  const { token, me } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(work?.coverUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const publishIntent = useRef(work?.published ?? false);
  const formRef = useRef<HTMLFormElement>(null);

  const [showHelp, setShowHelp] = useState(false);
  // Title and language stay editable during preview, so they're controlled
  // (live in the panel); the body is snapshotted because its textarea hides.
  const [title, setTitle] = useState(work?.title ?? "");
  const [lang, setLang] = useState(work?.lang ?? "en");
  const [previewBody, setPreviewBody] = useState<string | null>(null);

  function togglePreview() {
    if (previewBody !== null) {
      setPreviewBody(null);
      return;
    }
    if (!formRef.current) return;
    setPreviewBody(String(new FormData(formRef.current).get("body") || ""));
  }

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
        toast.error("Could not load the list of writers — reload and try again.");
      });
  }, [token, isAdmin, toast]);

  async function onCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setCoverUrl(await uploadMedia(file, "covers"));
    } catch (e) {
      toast.error(e instanceof Error ? `Upload failed: ${e.message}` : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const publish = publishIntent.current;
    if (!token) return;
    setBusy(true);

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
      // The date shown on the site — when it was written, not when it was uploaded.
      publishedAt: form.get("publishedAt") ? String(form.get("publishedAt")) : undefined,
    };

    try {
      if (work) {
        await adminApi.updateWork(token, work.id, payload);
      } else {
        await adminApi.createWork(token, payload);
      }
      toast.success(publish ? `Published "${payload.title}"` : `Saved draft "${payload.title}"`);
      router.push("/admin/works");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save — try again.");
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!work || !token) return;
    if (!confirm(`Delete "${work.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await adminApi.deleteWork(token, work.id);
      toast.success(`Deleted "${work.title}"`);
      router.push("/admin/works");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete — try again.");
      setBusy(false);
    }
  }

  // Create mode can't submit until we know who's saving (and, for admins,
  // until the writer picker has loaded) — otherwise tenantId is unenforced.
  const submitBlocked = busy || uploading || (!work && (!me || (isAdmin && !tenants)));

  return (
    <form ref={formRef} onSubmit={(e) => void save(e)} className="space-y-5">
      {/* Invisible default submit: pressing Enter in a text field must keep
          the work's current published state, not silently unpublish it (the
          first submit button in tree order is the implicit-submission target). */}
      <button
        type="submit"
        tabIndex={-1}
        aria-hidden="true"
        disabled={submitBlocked}
        className="hidden"
        onClick={() => {
          publishIntent.current = work?.published ?? false;
        }}
      />
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
        <input
          name="title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <select
            name="lang"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className={inputCls}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Date <span className="font-normal text-[#7d7468]">(when it was written)</span>
          </span>
          <input
            name="publishedAt"
            type="date"
            defaultValue={work?.publishedAt ? work.publishedAt.slice(0, 10) : ""}
            className={inputCls}
          />
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

      {/* Body: editor and preview swap; the textarea stays in the DOM (hidden)
          so submitting from preview mode still sends the body. */}
      <div className={previewBody !== null ? "hidden" : "block"}>
        <div className="mb-1 flex items-center gap-2">
          <label htmlFor="work-body" className="text-sm font-medium">
            Body <span className="font-normal text-[#7d7468]">(Markdown)</span>
          </label>
          <MarkdownHelpButton open={showHelp} onToggle={() => setShowHelp((v) => !v)} />
        </div>
        {showHelp ? <MarkdownHelpPanel /> : null}
        <textarea
          id="work-body"
          name="body"
          rows={18}
          defaultValue={work?.body}
          className={`${inputCls} font-mono text-sm leading-relaxed`}
          placeholder={"# Title\n\nWrite here..."}
        />
      </div>

      {previewBody !== null ? (
        <section aria-label="Preview" className="rounded-xl border border-[#b0713b]/20 bg-[#faf7f0] p-6 sm:p-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#b0713b]">
            Preview
            <span className="ml-2 font-normal normal-case tracking-normal text-[#7d7468]">
              — colors and fonts follow the writer&apos;s theme on the live site
            </span>
          </p>
          {/* Same 632px text column as the live work page, so wrapping is honest. */}
          <div className="mx-auto max-w-[632px]">
            <h1
              lang={lang !== "en" ? lang : undefined}
              className="font-[family-name:var(--font-serif)] text-3xl text-[#2b2620]"
            >
              {title || <span className="text-[#7d7468]">(untitled)</span>}
            </h1>
            <div aria-hidden className="my-5 text-[#b0713b]/50" style={{ letterSpacing: "0.6em" }}>
              &#10086;&#xfe0e;
            </div>
            {previewBody.trim() ? (
              <div
                className="work-body"
                lang={lang !== "en" ? lang : undefined}
                style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                  fontSize: "1.1rem",
                  lineHeight: 1.85,
                  color: "#2b2620",
                }}
              >
                <ReactMarkdown
                  components={{
                    // Links open a new tab in preview: a stray click must never
                    // navigate away and destroy the unsaved manuscript.
                    a: ({ children, ...props }) => (
                      <a {...props} target="_blank" rel="noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {previewBody}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-[#7d7468]">Nothing to preview yet — write something first.</p>
            )}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitBlocked}
          onClick={() => {
            publishIntent.current = false;
          }}
          className="rounded-lg border border-black/15 px-5 py-2.5 font-semibold hover:bg-black/5 disabled:opacity-60"
        >
          {work?.published ? "Unpublish & save draft" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={togglePreview}
          className="rounded-lg border border-[#b0713b]/50 px-5 py-2.5 font-semibold text-[#b0713b] hover:bg-[#b0713b]/5"
        >
          {previewBody !== null ? "Back to editing" : "Preview"}
        </button>
        <button
          type="submit"
          disabled={submitBlocked}
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
