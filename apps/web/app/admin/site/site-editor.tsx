"use client";

import { useState } from "react";
import type { Tenant, TenantProfile, TenantTheme, TimelineEntry } from "@darbha/types";
import { THEME_PRESETS } from "@darbha/types";
import { PALETTES } from "@darbha/ui";
import { adminApi } from "@/lib/api";
import { uploadMedia } from "@/lib/supabase";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-2.5 outline-none focus:border-[#b0713b]";
const labelCls = "mb-1 block text-sm font-medium";
const sectionCls = "rounded-2xl bg-white p-6 shadow-sm";
const headingCls =
  "text-xs font-semibold uppercase tracking-[0.14em] text-[#b0713b]";

/** Public URL of a tenant site, localhost-aware like the apex gallery cards. */
function siteUrl(slug: string): string {
  if (process.env.NODE_ENV === "development") return `http://${slug}.localhost:3400`;
  return `https://${slug}.${SITE_DOMAIN}`;
}

interface RowsState {
  education: TimelineEntry[];
  career: TimelineEntry[];
}

/**
 * Editor for a tenant's public identity + "Life" profile. Every field is
 * optional — anything left blank simply doesn't appear on the public site.
 * Mount with key={tenant.id} so switching sites resets the form.
 */
export function SiteEditor({ tenant, token }: { tenant: Tenant; token: string }) {
  const theme = tenant.theme as TenantTheme;
  const profile = (tenant.profile ?? {}) as TenantProfile;

  const [displayName, setDisplayName] = useState(tenant.displayName);
  const [tagline, setTagline] = useState(tenant.tagline ?? "");
  const [bio, setBio] = useState(tenant.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(tenant.avatarUrl ?? "");
  const [preset, setPreset] = useState<TenantTheme["preset"]>(theme?.preset ?? "ivory");

  const [roles, setRoles] = useState((profile.roles ?? []).join(", "));
  const [bornDate, setBornDate] = useState(profile.born?.date ?? "");
  const [bornPlace, setBornPlace] = useState(profile.born?.place ?? "");
  const [father, setFather] = useState(profile.parents?.father ?? "");
  const [mother, setMother] = useState(profile.parents?.mother ?? "");
  const [rows, setRows] = useState<RowsState>({
    education: profile.education ?? [],
    career: profile.career ?? [],
  });

  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function mutateRows(kind: keyof RowsState, fn: (list: TimelineEntry[]) => TimelineEntry[]) {
    setSaved(false);
    setRows((prev) => ({ ...prev, [kind]: fn(prev[kind]) }));
  }

  async function onAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setAvatarUrl(await uploadMedia(file, "avatars"));
      setSaved(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Photo upload failed: ${e.message}`
          : "Photo upload failed — try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);

    const cleanRows = (list: TimelineEntry[]) =>
      list
        .map((r) => ({
          period: r.period.trim(),
          title: r.title.trim(),
          detail: r.detail?.trim() || undefined,
        }))
        .filter((r) => r.period || r.title || r.detail);

    const roleList = roles
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    const education = cleanRows(rows.education);
    const career = cleanRows(rows.career);

    // Empty sections are omitted entirely so the public page hides them.
    const nextProfile: TenantProfile = {
      ...(roleList.length ? { roles: roleList } : {}),
      ...(bornDate.trim() || bornPlace.trim()
        ? { born: { date: bornDate.trim() || undefined, place: bornPlace.trim() || undefined } }
        : {}),
      ...(father.trim() || mother.trim()
        ? { parents: { father: father.trim() || undefined, mother: mother.trim() || undefined } }
        : {}),
      ...(education.length ? { education } : {}),
      ...(career.length ? { career } : {}),
    };

    try {
      await adminApi.updateTenant(token, tenant.id, {
        displayName: displayName.trim() || tenant.displayName,
        tagline: tagline.trim(),
        bio: bio.trim(),
        avatarUrl,
        theme: { ...theme, preset },
        profile: nextProfile,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSave(e)} className="space-y-6">
      {/* ---- Identity ---- */}
      <section className={sectionCls}>
        <h2 className={headingCls}>Identity</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Display name</span>
              <input
                required
                maxLength={80}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setSaved(false);
                }}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>
                Tagline <span className="font-normal text-[#7d7468]">(shown under your name)</span>
              </span>
              <input
                maxLength={140}
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  setSaved(false);
                }}
                className={inputCls}
                placeholder="Poems, mostly at night"
              />
            </label>
          </div>

          <label className="block">
            <span className={labelCls}>
              Bio <span className="font-normal text-[#7d7468]">(a short introduction)</span>
            </span>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setSaved(false);
              }}
              className={inputCls}
            />
          </label>

          <div className="flex flex-wrap items-start gap-6">
            <div>
              <span className={labelCls}>Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void onAvatarChange(e)}
                className="text-sm"
              />
              {uploading ? <p className="mt-1 text-sm text-[#7d7468]">Uploading&hellip;</p> : null}
              {avatarUrl ? (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-20 w-20 rounded-full border border-black/10 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl("");
                      setSaved(false);
                    }}
                    className="text-sm text-red-700 hover:underline"
                  >
                    Remove photo
                  </button>
                </div>
              ) : null}
            </div>
            <div>
              <span className={labelCls}>Theme</span>
              <div className="flex items-center gap-2">
                {THEME_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    title={p}
                    onClick={() => {
                      setPreset(p);
                      setSaved(false);
                    }}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      preset === p ? "border-[#2b2620]" : "border-transparent"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${PALETTES[p].gradient[0]}, ${PALETTES[p].gradient[1]})`,
                    }}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-[#7d7468]">Colors for your site and gallery card.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Life ---- */}
      <section className={sectionCls}>
        <h2 className={headingCls}>Life</h2>
        <p className="mt-2 text-sm text-[#7d7468]">
          Everything here is optional — sections you leave blank simply don&apos;t appear on your
          site.
        </p>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className={labelCls}>
              Roles <span className="font-normal text-[#7d7468]">(comma separated)</span>
            </span>
            <input
              value={roles}
              onChange={(e) => {
                setRoles(e.target.value);
                setSaved(false);
              }}
              className={inputCls}
              placeholder="Educator, Scholar, Poet, Playwright"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Date of birth</span>
              <input
                value={bornDate}
                onChange={(e) => {
                  setBornDate(e.target.value);
                  setSaved(false);
                }}
                className={inputCls}
                placeholder="9th February, 1946"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Place of birth</span>
              <input
                value={bornPlace}
                onChange={(e) => {
                  setBornPlace(e.target.value);
                  setSaved(false);
                }}
                className={inputCls}
                placeholder="Bapatla, Andhra Pradesh"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Father</span>
              <input
                value={father}
                onChange={(e) => {
                  setFather(e.target.value);
                  setSaved(false);
                }}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Mother</span>
              <input
                value={mother}
                onChange={(e) => {
                  setMother(e.target.value);
                  setSaved(false);
                }}
                className={inputCls}
              />
            </label>
          </div>
        </div>
      </section>

      <TimelineSection
        title="Education"
        rows={rows.education}
        onChange={(fn) => mutateRows("education", fn)}
        placeholders={{ period: "M.Com", title: "Andhra University", detail: "Visakhapatnam, AP" }}
      />
      <TimelineSection
        title="Career"
        rows={rows.career}
        onChange={(fn) => mutateRows("career", fn)}
        placeholders={{
          period: "1998 – 2004",
          title: "Head of Department of Commerce",
          detail: "The Bapatla College of Arts & Sciences",
        }}
      />

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy || uploading}
          className="rounded-lg bg-[#b0713b] px-6 py-2.5 font-semibold text-white hover:bg-[#9a6233] disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {saved ? (
          <span className="text-sm text-green-700">
            Saved ✓{" "}
            <a
              href={siteUrl(tenant.slug)}
              target="_blank"
              rel="noreferrer"
              className="text-[#b0713b] underline"
            >
              View site →
            </a>
            <span className="ml-1 text-[#7d7468]">(public pages refresh within a minute)</span>
          </span>
        ) : null}
      </div>
    </form>
  );
}

function TimelineSection({
  title,
  rows,
  onChange,
  placeholders,
}: {
  title: string;
  rows: TimelineEntry[];
  onChange: (fn: (list: TimelineEntry[]) => TimelineEntry[]) => void;
  placeholders: { period: string; title: string; detail: string };
}) {
  function setField(index: number, field: keyof TimelineEntry, value: string) {
    onChange((list) => list.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }
  function move(index: number, delta: -1 | 1) {
    onChange((list) => {
      const next = [...list];
      const j = index + delta;
      if (j < 0 || j >= next.length) return list;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  return (
    <section className={sectionCls}>
      <div className="flex items-center justify-between">
        <h2 className={headingCls}>{title}</h2>
        <button
          type="button"
          onClick={() => onChange((list) => [...list, { period: "", title: "" }])}
          className="rounded-lg border border-black/15 px-3 py-1 text-sm font-semibold hover:bg-black/5"
        >
          + Add entry
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[#7d7468]">
          No entries yet — this section stays hidden on the public site.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row, i) => (
            <li key={i} className="rounded-xl border border-black/10 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_1.4fr_auto]">
                <label className="block">
                  <span className="mb-1 block text-xs text-[#7d7468]">Period</span>
                  <input
                    value={row.period}
                    onChange={(e) => setField(i, "period", e.target.value)}
                    className={inputCls}
                    placeholder={placeholders.period}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-[#7d7468]">Title</span>
                  <input
                    value={row.title}
                    onChange={(e) => setField(i, "title", e.target.value)}
                    className={inputCls}
                    placeholder={placeholders.title}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-[#7d7468]">Detail (optional)</span>
                  <input
                    value={row.detail ?? ""}
                    onChange={(e) => setField(i, "detail", e.target.value)}
                    className={inputCls}
                    placeholder={placeholders.detail}
                  />
                </label>
                <div className="flex items-end gap-1 pb-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    title="Move up"
                    className="rounded border border-black/15 px-2 py-1.5 text-xs hover:bg-black/5 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    title="Move down"
                    className="rounded border border-black/15 px-2 py-1.5 text-xs hover:bg-black/5 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange((list) => list.filter((_, j) => j !== i))}
                    title="Remove entry"
                    className="rounded border border-red-200 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
