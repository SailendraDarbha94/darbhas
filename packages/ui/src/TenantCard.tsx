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

/** A frosted liquid-glass card for the apex gallery, tinted with the tenant's palette. */
export function TenantCard({ tenant, href }: TenantCardProps) {
  const palette = paletteFor(tenant.theme);
  const font = fontFamilyFor(tenant.theme);
  const g = palette.glass;

  // Colored glass: a translucent wash of the tenant's own gradient (so each
  // person stays visually distinct) layered under the frosted-glass material.
  const [g0, g1] = palette.gradient;

  return (
    <a
      href={href}
      className="darbha-card"
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "1rem",
        minHeight: 232,
        padding: "1.75rem",
        borderRadius: 24,
        textDecoration: "none",
        color: palette.text,
        background: `linear-gradient(150deg, ${g0}e0, ${g1}cc)`,
        border: `1px solid ${g.border}`,
        backdropFilter: `blur(${g.blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${g.blur}px) saturate(180%)`,
        boxShadow: g.shadow,
        transition: "transform 200ms ease, box-shadow 200ms ease",
      }}
    >
      {/* Specular top highlight */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          insetInline: 0,
          top: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${g.highlight}, transparent)`,
        }}
      />
      {/* Oversized genre glyph watermark */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: "-0.15em",
          bottom: "-0.35em",
          fontSize: "7.5rem",
          lineHeight: 1,
          color: palette.accent,
          opacity: palette.dark ? 0.14 : 0.1,
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
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: `1px solid ${g.border}`,
            }}
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
              background: g.surfaceStrong,
              border: `1px solid ${g.border}`,
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
