import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { TenantProfile, TenantTheme, Work, WorkType } from "@darbha/types";
import { WORK_TYPES } from "@darbha/types";
import { GENRE_GLYPHS, GENRE_LABELS, TenantHero, TenantLife, WorkCard, fontFamilyFor, paletteFor } from "@darbha/ui";
import { ApiError, getTenantBySlug } from "@/lib/api";
import { tenantUrl } from "@/lib/tenant-host";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tenant = await getTenantBySlug(slug);
    const url = tenantUrl(slug);
    const description = tenant.bio ?? tenant.tagline ?? `Writing by ${tenant.displayName}`;
    return {
      title: tenant.displayName,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "profile",
        url,
        siteName: tenant.displayName,
        title: tenant.displayName,
        description,
        images: tenant.avatarUrl ? [tenant.avatarUrl] : undefined,
      },
      twitter: {
        card: tenant.avatarUrl ? "summary_large_image" : "summary",
        title: tenant.displayName,
        description,
      },
    };
  } catch {
    return { title: "Not found", robots: { index: false } };
  }
}

export default async function TenantPage({ params }: Props) {
  const { slug } = await params;

  let tenant;
  try {
    tenant = await getTenantBySlug(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const theme = tenant.theme as TenantTheme;
  const profile = (tenant.profile ?? null) as TenantProfile | null;
  const palette = paletteFor(theme);
  const font = fontFamilyFor(theme);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: tenant.displayName,
      url: tenantUrl(slug),
      ...(tenant.bio ?? tenant.tagline ? { description: tenant.bio ?? tenant.tagline } : {}),
      ...(profile?.roles?.length ? { jobTitle: profile.roles } : {}),
      ...(tenant.avatarUrl ? { image: tenant.avatarUrl } : {}),
    },
  };

  // Group works by type, in a stable genre order, so poets-and-playwrights
  // get one section per collection. A single-genre writer sees no headers.
  const groups = WORK_TYPES.map((type) => ({
    type,
    works: tenant.works.filter((w) => w.type === type),
  })).filter((g) => g.works.length > 0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: palette.ground,
        backgroundAttachment: "fixed",
        color: palette.text,
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TenantHero
        tenant={{ ...tenant, theme }}
        rolesLine={profile?.roles?.length ? profile.roles.join(" \u2022 ") : undefined}
      />

      {profile ? <TenantLife profile={profile} theme={theme} /> : null}

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "1rem 1.5rem 5rem" }}>
        {tenant.works.length === 0 ? (
          <p style={{ textAlign: "center", color: palette.muted, padding: "3rem 0" }}>
            Nothing published yet — come back soon.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.type} style={{ marginBottom: "2.5rem" }}>
              {groups.length > 1 ? (
                <GroupHeader type={group.type} font={font} accent={palette.accent} text={palette.text} />
              ) : null}
              <div style={{ display: "grid", gap: "1.25rem" }}>
                {group.works.map((work) => (
                  <WorkCard key={work.id} work={work} theme={theme} href={`/works/${work.id}`} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <footer style={{ padding: "2rem", textAlign: "center", fontSize: "0.85rem", color: palette.muted }}>
        Part of the{" "}
        <a href={`https://${process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info"}`} style={{ color: palette.accent }}>
          Darbha family
        </a>
      </footer>
    </main>
  );
}

function GroupHeader({
  type,
  font,
  accent,
  text,
}: {
  type: WorkType;
  font: string;
  accent: string;
  text: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", margin: "0 0 1.25rem" }}>
      <span aria-hidden style={{ color: accent, fontSize: "1.1rem" }}>
        {GENRE_GLYPHS[type]}
      </span>
      <h2 style={{ fontFamily: font, fontSize: "1.6rem", margin: 0, color: text }}>
        {GENRE_LABELS[type]}
      </h2>
      <div
        style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${accent}44, transparent)` }}
      />
    </div>
  );
}
