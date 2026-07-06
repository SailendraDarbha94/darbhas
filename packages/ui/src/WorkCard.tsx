import type { TenantTheme, Work } from "@darbha/types";
import { fontFamilyFor, paletteFor } from "./palettes";

export interface WorkCardProps {
  work: Pick<Work, "title" | "excerpt" | "coverUrl" | "publishedAt" | "tags">;
  theme: TenantTheme;
  href: string;
}

/** A single work in the subdomain's list of writings. */
export function WorkCard({ work, theme, href }: WorkCardProps) {
  const palette = paletteFor(theme);
  const font = fontFamilyFor(theme);
  const date = work.publishedAt
    ? new Date(work.publishedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <a
      href={href}
      className="darbha-card"
      style={{
        display: "block",
        padding: "1.5rem 1.75rem",
        borderRadius: 16,
        textDecoration: "none",
        background: palette.surface,
        color: palette.text,
        border: `1px solid ${palette.accent}1f`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        transition: "transform 150ms ease, box-shadow 150ms ease",
      }}
    >
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
          }}
        />
      ) : null}
      <h3 style={{ fontFamily: font, fontSize: "1.35rem", margin: "0 0 0.35rem" }}>{work.title}</h3>
      {work.excerpt ? (
        <p style={{ margin: "0 0 0.75rem", lineHeight: 1.6, color: palette.muted }}>{work.excerpt}</p>
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
