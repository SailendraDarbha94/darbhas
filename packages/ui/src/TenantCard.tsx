import type { Tenant, TenantTheme } from "@darbha/types";
import { fontFamilyFor, paletteFor } from "./palettes";
import { GENRE_GLYPHS, GENRE_LABELS } from "./genre";

export interface TenantCardProps {
  tenant: Pick<Tenant, "slug" | "displayName" | "tagline" | "genre" | "avatarUrl"> & {
    theme: TenantTheme;
  };
  /** Full URL of the tenant's subdomain, e.g. https://sailendra.darbha.info */
  href: string;
}

/** A "cool looking card" for the apex gallery, themed per tenant. */
export function TenantCard({ tenant, href }: TenantCardProps) {
  const palette = paletteFor(tenant.theme);
  const font = fontFamilyFor(tenant.theme);

  return (
    <a
      href={href}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "1rem",
        minHeight: 230,
        padding: "1.75rem",
        borderRadius: 20,
        textDecoration: "none",
        color: palette.text,
        background: `linear-gradient(135deg, ${palette.gradient[0]}, ${palette.gradient[1]})`,
        border: `1px solid ${palette.accent}22`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 12px 32px -16px rgba(0,0,0,0.25)",
        transition: "transform 150ms ease, box-shadow 150ms ease",
      }}
      className="darbha-card"
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: "-0.15em",
          bottom: "-0.35em",
          fontSize: "7.5rem",
          lineHeight: 1,
          color: palette.accent,
          opacity: 0.1,
          fontFamily: font,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {GENRE_GLYPHS[tenant.genre]}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
        {tenant.avatarUrl ? (
          <img
            src={tenant.avatarUrl}
            alt=""
            width={52}
            height={52}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: palette.surface,
              color: palette.accent,
              fontSize: "1.5rem",
            }}
          >
            {GENRE_GLYPHS[tenant.genre]}
          </span>
        )}
        <div>
          <div style={{ fontFamily: font, fontSize: "1.35rem", fontWeight: 600 }}>
            {tenant.displayName}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: palette.accent,
              fontWeight: 600,
            }}
          >
            {GENRE_LABELS[tenant.genre]}
          </div>
        </div>
      </div>

      {tenant.tagline ? (
        <p style={{ fontFamily: font, fontStyle: "italic", color: palette.muted, margin: 0 }}>
          &ldquo;{tenant.tagline}&rdquo;
        </p>
      ) : null}

      <div style={{ fontSize: "0.85rem", color: palette.muted }}>
        {tenant.slug}.darbha.info <span style={{ color: palette.accent }}>&rarr;</span>
      </div>
    </a>
  );
}
