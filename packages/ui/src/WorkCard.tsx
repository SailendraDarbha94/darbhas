import type { TenantTheme, Work } from "@darbha/types";
import { fontFamilyFor, glassStyle, paletteFor } from "./palettes";
import { formatDate } from "./date";

export interface WorkCardProps {
  work: Pick<Work, "title" | "excerpt" | "coverUrl" | "publishedAt" | "tags"> & { lang?: string };
  theme: TenantTheme;
  href: string;
}

/** A single work in the subdomain's list of writings, as a frosted-glass card. */
export function WorkCard({ work, theme, href }: WorkCardProps) {
  const palette = paletteFor(theme);
  const font = fontFamilyFor(theme);
  const g = palette.glass;
  const date = work.publishedAt ? formatDate(work.publishedAt) : null;

  return (
    <a
      href={href}
      className="darbha-card"
      style={{
        position: "relative",
        display: "block",
        overflow: "hidden",
        padding: "1.5rem 1.75rem",
        borderRadius: 18,
        textDecoration: "none",
        color: palette.text,
        transition: "transform 200ms ease, box-shadow 200ms ease",
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
      {work.coverUrl ? (
        <img
          src={work.coverUrl}
          alt=""
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            borderRadius: 12,
            marginBottom: "1rem",
            border: `1px solid ${g.border}`,
          }}
        />
      ) : null}
      <h3
        lang={work.lang !== "en" ? work.lang : undefined}
        style={{ fontFamily: font, fontSize: "1.35rem", margin: "0 0 0.35rem" }}
      >
        {work.title}
      </h3>
      {work.excerpt ? (
        <p
          lang={work.lang !== "en" ? work.lang : undefined}
          style={{ margin: "0 0 0.75rem", lineHeight: 1.6, color: palette.muted }}
        >
          {work.excerpt}
        </p>
      ) : null}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        {date ? <span style={{ fontSize: "0.8rem", color: palette.muted }}>{date}</span> : null}
        {work.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "0.72rem",
              padding: "0.15rem 0.6rem",
              borderRadius: 999,
              background: `${palette.accent}14`,
              border: `1px solid ${palette.accent}22`,
              color: palette.accent,
              fontWeight: 600,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
