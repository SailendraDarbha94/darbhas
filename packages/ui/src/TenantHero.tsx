import type { Tenant, TenantTheme } from "@darbha/types";
import { fontFamilyFor, paletteFor } from "./palettes";
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

  return (
    <header
      style={{
        padding: "4.5rem 1.5rem 3rem",
        textAlign: "center",
        background: `linear-gradient(180deg, ${palette.gradient[0]}, transparent)`,
      }}
    >
      {tenant.avatarUrl ? (
        <img
          src={tenant.avatarUrl}
          alt={tenant.displayName}
          width={88}
          height={88}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${palette.surface}`,
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.3)",
          }}
        />
      ) : (
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: palette.surface,
            color: palette.accent,
            fontSize: "2.25rem",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.2)",
          }}
        >
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
