"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_CLAPS_PER_READER } from "@darbha/types";
import { glassStyle, type Palette } from "@darbha/ui";
import { getClaps, sendClaps } from "@/lib/api";

const VISITOR_KEY = "darbha:visitor";
/** Taps are batched: one request shortly after the reader stops tapping. */
const FLUSH_MS = 600;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function newUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** This browser's reader id, if it has ever clapped. Never creates one. */
function storedReaderId(): string | null {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    return existing && UUID_RE.test(existing) ? existing : null;
  } catch {
    return null;
  }
}

/**
 * Created on the first clap only — readers who just read get nothing stored.
 * A random id: no cookie, no account, nothing else attached.
 */
function ensureReaderId(): string {
  const existing = storedReaderId();
  if (existing) return existing;
  const id = newUuid();
  try {
    localStorage.setItem(VISITOR_KEY, id);
  } catch {
    // Storage blocked (private mode, strict settings): claps still work for this visit.
  }
  return id;
}

/** Raised hand, from Lucide (ISC licence). */
function HandIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.18 : undefined}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

/**
 * Medium-style applause for a work: tap up to 50 times. Counts update
 * instantly and save in batches; if the API is unreachable the button simply
 * doesn't render.
 */
export function ClapButton({ workId, palette }: { workId: string; palette: Palette }) {
  // What the reader sees: server state plus taps not yet confirmed.
  const [view, setView] = useState<{ total: number; mine: number } | null>(null);
  const [burst, setBurst] = useState(0);
  const [failed, setFailed] = useState(false);
  const [limited, setLimited] = useState(false);
  // Screen-reader announcement, written only when a save settles.
  const [announce, setAnnounce] = useState("");

  const idRef = useRef<string | null>(null);
  const serverRef = useRef<{ total: number; mine: number } | null>(null);
  const unconfirmedRef = useRef(0); // tapped, not yet reflected in server state
  const queuedRef = useRef(0); // tapped, not yet sent
  const inFlightRef = useRef(false);
  const limitedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sync = useCallback(() => {
    const s = serverRef.current;
    if (s) setView({ total: s.total + unconfirmedRef.current, mine: s.mine + unconfirmedRef.current });
  }, []);

  const flush = useCallback(
    async (keepalive = false) => {
      timerRef.current = null;
      const id = idRef.current;
      const n = queuedRef.current;
      // A leaving reader's final batch may overlap an in-flight one; the
      // server's cap is atomic, so that's safe.
      if (!id || n === 0 || (inFlightRef.current && !keepalive)) return;
      inFlightRef.current = true;
      queuedRef.current = 0;
      try {
        const s = await sendClaps(workId, id, n, keepalive);
        serverRef.current = { total: s.total, mine: s.mine };
        setFailed(false);
        if (s.limited) {
          limitedRef.current = true;
          setLimited(true);
        }
        setAnnounce(
          s.mine >= MAX_CLAPS_PER_READER
            ? `All ${MAX_CLAPS_PER_READER} claps given. Thank you.`
            : s.limited
              ? `Clap limit reached on this network. You clapped ${s.mine}.`
              : `You clapped ${s.mine}. ${s.total} claps in total.`,
        );
      } catch {
        setFailed(true); // these taps are dropped; the count falls back
        setAnnounce("Couldn't save those claps. Try again.");
      } finally {
        unconfirmedRef.current -= n;
        inFlightRef.current = false;
        sync();
        if (queuedRef.current > 0 && !timerRef.current) {
          timerRef.current = setTimeout(() => void flush(), FLUSH_MS);
        }
      }
    },
    [workId, sync],
  );

  useEffect(() => {
    idRef.current = storedReaderId();
    let cancelled = false;
    getClaps(workId, idRef.current ?? undefined)
      .then((s) => {
        if (cancelled) return;
        serverRef.current = { total: s.total, mine: s.mine };
        limitedRef.current = s.limited;
        setLimited(s.limited);
        sync();
      })
      .catch(() => {
        // API unreachable or work not clappable: render nothing.
      });
    return () => {
      cancelled = true;
    };
  }, [workId, sync]);

  // Don't lose the last few taps when the reader moves on. Mobile browsers
  // often skip `pagehide` when switching apps; going hidden is the last
  // event they reliably fire.
  useEffect(() => {
    const onHide = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      void flush(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      onHide();
    };
  }, [flush]);

  function onClap() {
    const s = serverRef.current;
    if (!s || limitedRef.current || s.mine + unconfirmedRef.current >= MAX_CLAPS_PER_READER) return;
    if (!idRef.current) idRef.current = ensureReaderId();
    unconfirmedRef.current += 1;
    queuedRef.current += 1;
    sync();
    setBurst((b) => b + 1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(), FLUSH_MS);
  }

  if (!view) return null;
  const maxed = view.mine >= MAX_CLAPS_PER_READER;
  const blocked = maxed || limited;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.9rem",
        marginTop: "3.5rem",
      }}
    >
      <div style={{ position: "relative" }}>
        {burst > 0 ? (
          <span
            key={burst}
            className="clap-burst"
            aria-hidden
            style={{
              background: palette.accent,
              color: palette.bg,
              fontSize: "0.8rem",
              fontWeight: 700,
              padding: "0.15rem 0.55rem",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            +{view.mine}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onClap}
          aria-disabled={blocked}
          aria-label={
            maxed
              ? `You've given this work all ${MAX_CLAPS_PER_READER} claps`
              : limited
                ? "Clap limit reached on this network"
                : `Clap for this work — ${view.mine} of ${MAX_CLAPS_PER_READER} given`
          }
          className="clap-btn"
          style={{
            ...glassStyle(palette),
            width: 58,
            height: 58,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: palette.accent,
            cursor: blocked ? "default" : "pointer",
            ...(view.mine > 0 ? { border: `1px solid ${palette.accent}` } : {}),
          }}
        >
          <HandIcon filled={view.mine > 0} />
        </button>
      </div>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: palette.text }}>
          {view.total.toLocaleString()} {view.total === 1 ? "clap" : "claps"}
        </div>
        <div style={{ fontSize: "0.8rem", color: failed ? palette.accent : palette.muted }}>
          {failed
            ? "Couldn't save those — try again"
            : maxed
              ? `All ${MAX_CLAPS_PER_READER} given — thank you`
              : limited
                ? "Clap limit reached on this network"
                : view.mine > 0
                  ? `You clapped ${view.mine}`
                  : `Tap to applaud — up to ${MAX_CLAPS_PER_READER}`}
        </div>
      </div>
      <span role="status" className="sr-only">
        {announce}
      </span>
    </div>
  );
}
