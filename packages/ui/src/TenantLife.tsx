import type { TenantProfile, TenantTheme, TimelineEntry } from "@darbha/types";
import { fontFamilyFor, paletteFor } from "./palettes";

export interface TenantLifeProps {
  profile: TenantProfile;
  theme: TenantTheme;
}

/** Biography section: birth details, parents, and education/career timelines. */
export function TenantLife({ profile, theme }: TenantLifeProps) {
  const palette = paletteFor(theme);
  const font = fontFamilyFor(theme);

  const facts: { label: string; value: string }[] = [];
  if (profile.born?.date) facts.push({ label: "Date of birth", value: profile.born.date });
  if (profile.born?.place) facts.push({ label: "Place of birth", value: profile.born.place });
  if (profile.parents?.father) facts.push({ label: "Father", value: profile.parents.father });
  if (profile.parents?.mother) facts.push({ label: "Mother", value: profile.parents.mother });

  const hasTimeline =
    (profile.education?.length ?? 0) > 0 || (profile.career?.length ?? 0) > 0;
  if (facts.length === 0 && !hasTimeline) return null;

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.5rem 3rem" }}>
      <SectionTitle title="Life" font={font} accent={palette.accent} text={palette.text} />

      {facts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            marginBottom: hasTimeline ? "2.25rem" : 0,
          }}
        >
          {facts.map((fact) => (
            <div
              key={fact.label}
              style={{
                background: palette.surface,
                border: `1px solid ${palette.accent}1f`,
                borderRadius: 14,
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: palette.accent,
                  fontWeight: 700,
                  marginBottom: "0.3rem",
                }}
              >
                {fact.label}
              </div>
              <div style={{ color: palette.text, lineHeight: 1.5 }}>{fact.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {profile.education?.length ? (
        <Timeline title="Education" entries={profile.education} palette={palette} font={font} />
      ) : null}
      {profile.career?.length ? (
        <Timeline title="Career" entries={profile.career} palette={palette} font={font} />
      ) : null}
    </section>
  );
}

function SectionTitle({
  title,
  font,
  accent,
  text,
}: {
  title: string;
  font: string;
  accent: string;
  text: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", margin: "0 0 1.5rem" }}>
      <h2 style={{ fontFamily: font, fontSize: "1.6rem", margin: 0, color: text }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${accent}44, transparent)` }} />
    </div>
  );
}

function Timeline({
  title,
  entries,
  palette,
  font,
}: {
  title: string;
  entries: TimelineEntry[];
  palette: ReturnType<typeof paletteFor>;
  font: string;
}) {
  return (
    <div style={{ marginBottom: "2.25rem" }}>
      <h3
        style={{
          fontSize: "0.78rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: palette.accent,
          fontWeight: 700,
          margin: "0 0 1rem",
        }}
      >
        {title}
      </h3>
      <div style={{ borderLeft: `2px solid ${palette.accent}33`, paddingLeft: "1.5rem", display: "grid", gap: "1.25rem" }}>
        {entries.map((entry, i) => (
          <div key={i} style={{ position: "relative" }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: "calc(-1.5rem - 5px)",
                top: "0.4rem",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: palette.accent,
              }}
            />
            <div style={{ fontSize: "0.8rem", color: palette.muted, marginBottom: "0.15rem" }}>
              {entry.period}
            </div>
            <div style={{ fontFamily: font, fontSize: "1.05rem", fontWeight: 600, color: palette.text }}>
              {entry.title}
            </div>
            {entry.detail ? (
              <div style={{ fontSize: "0.9rem", color: palette.muted, marginTop: "0.15rem" }}>
                {entry.detail}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
