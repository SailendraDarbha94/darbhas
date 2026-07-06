import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { TenantTheme } from "@darbha/types";
import { TenantHero, WorkCard, paletteFor } from "@darbha/ui";
import { ApiError, getTenantBySlug } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tenant = await getTenantBySlug(slug);
    return {
      title: tenant.displayName,
      description: tenant.tagline ?? `Writing by ${tenant.displayName}`,
    };
  } catch {
    return { title: "Not found" };
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
  const palette = paletteFor(theme);

  return (
    <main style={{ minHeight: "100vh", background: palette.bg, color: palette.text }}>
      <TenantHero tenant={{ ...tenant, theme }} />

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "1rem 1.5rem 5rem" }}>
        {tenant.works.length === 0 ? (
          <p style={{ textAlign: "center", color: palette.muted, padding: "3rem 0" }}>
            Nothing published yet — come back soon.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {tenant.works.map((work) => (
              <WorkCard key={work.id} work={work} theme={theme} href={`/works/${work.id}`} />
            ))}
          </div>
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
