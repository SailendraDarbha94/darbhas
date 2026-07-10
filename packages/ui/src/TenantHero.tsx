import type { Tenant, TenantTheme } from "@darbha/types";
import { fontFamilyFor, glassStyle, paletteFor } from "./palettes";
import { GENRE_GLYPHS, GENRE_LABELS } from "./genre";

export interface TenantHeroProps {
  tenant: Pick<Tenant, "displayName" | "tagline" | "genre" | "bio" | "avatarUrl"> & {
    theme: TenantTheme;
  };
  /** Overrides the genre label, e.g. "Educator • Scholar • Poet • Playwright". */
  rolesLine?: string;
}

/** Header block for a person's subdomain site. */
export function TenantHero({ tenant, rolesLine }: TenantHeroProps) {
  const palette = paletteFor(tenant.theme);
  const font = fontFamilyFor(tenant.theme);
  const g = palette.glass;

  return (
    <header
      style={{
        padding: "4.5rem 1.5rem 3rem",
        textAlign: "center",
      }}
    >
      {tenant.avatarUrl ? (
        <img
          src={tenant.avatarUrl}
          alt={tenant.displayName}
          width={92}
          height={92}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            border: `1px solid ${g.border}`,
            boxShadow: g.shadow,
          }}
        />
      ) : (
        <span
          aria-hidden
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 92,
            height: 92,
            borderRadius: "50%",
            overflow: "hidden",
            color: palette.accent,
            fontSize: "2.25rem",
            ...glassStyle(palette),
          }}
        >
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
          {GENRE_GLYPHS[tenant.genre]}
        </span>
      )}

      <p
        style={{
          margin: "1.5rem 0 0.25rem",
          fontSize: "0.75rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.accent,
          fontWeight: 700,
        }}
      >
        {rolesLine ?? GENRE_LABELS[tenant.genre]}
      </p>
      <h1 style={{ fontFamily: font, fontSize: "2.75rem", margin: "0 0 0.5rem", color: palette.text }}>
        {tenant.displayName}
      </h1>
      {tenant.tagline ? (
        <p style={{ fontFamily: font, fontStyle: "italic", fontSize: "1.15rem", color: palette.muted, margin: 0 }}>
          {tenant.tagline}
        </p>
      ) : null}
      {tenant.bio ? (
        <p
          style={{
            maxWidth: 560,
            margin: "1.25rem auto 0",
            lineHeight: 1.7,
            color: palette.muted,
          }}
        >
          {tenant.bio}
        </p>
      ) : null}

      <div
        aria-hidden
        style={{
          marginTop: "2.25rem",
          color: palette.accent,
          opacity: 0.55,
          fontSize: "1.1rem",
          letterSpacing: "0.75em",
          paddingLeft: "0.75em",
        }}
      >
        &#10086;&#xfe0e; &#10086;&#xfe0e; &#10086;&#xfe0e;
      </div>
    </header>
  );
}
