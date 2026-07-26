import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { TenantTheme } from "@darbha/types";
import { GENRE_LABELS, fontFamilyFor, formatDate, glassStyle, paletteFor, type Palette } from "@darbha/ui";
import { ApiError, getTenantBySlug } from "@/lib/api";
import { tenantUrl } from "@/lib/tenant-host";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

async function load({ params }: Props) {
  const { slug, id } = await params;
  try {
    const tenant = await getTenantBySlug(slug);
    const work = tenant.works.find((w) => w.id === id);
    if (!work) return null;
    return { tenant, work, slug, id };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props);
  if (!data) return { title: "Not found", robots: { index: false } };
  const { tenant, work, slug, id } = data;
  const url = `${tenantUrl(slug)}/works/${id}`;
  const description = work.excerpt ?? `${work.title} — by ${tenant.displayName}`;
  return {
    title: `${work.title} — ${tenant.displayName}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: tenant.displayName,
      title: work.title,
      description,
      publishedTime: work.publishedAt ?? undefined,
      authors: [tenant.displayName],
      images: work.coverUrl ? [work.coverUrl] : undefined,
    },
    twitter: {
      card: work.coverUrl ? "summary_large_image" : "summary",
      title: work.title,
      description,
    },
  };
}

/** One glass card in the bottom nav: a neighbouring work or the way home. */
function NavCard({
  href,
  eyebrow,
  title,
  lang,
  align,
  palette,
  font,
}: {
  href: string;
  eyebrow: string;
  title: string;
  lang?: string;
  align: "left" | "right";
  palette: Palette;
  font: string;
}) {
  return (
    <a
      href={href}
      className="darbha-card"
      style={{
        flex: "1 1 240px",
        display: "block",
        padding: "1rem 1.25rem",
        borderRadius: 16,
        textDecoration: "none",
        color: palette.text,
        textAlign: align,
        transition: "transform 200ms ease, box-shadow 200ms ease",
        ...glassStyle(palette),
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: palette.accent,
          marginBottom: "0.3rem",
        }}
      >
        {eyebrow}
      </span>
      <span
        lang={lang && lang !== "en" ? lang : undefined}
        style={{ fontFamily: font, fontSize: "1.05rem", lineHeight: 1.5 }}
      >
        {title}
      </span>
    </a>
  );
}

export default async function WorkPage(props: Props) {
  const data = await load(props);
  if (!data) notFound();

  const { tenant, work, slug, id } = data;
  const theme = tenant.theme as TenantTheme;
  const palette = paletteFor(theme);
  const font = fontFamilyFor(theme);

  const date = work.publishedAt ? formatDate(work.publishedAt) : null;

  // Previous/next within the same collection (poems ↔ poems, talks ↔ talks),
  // in the order the tenant page lists them. The tenant is already loaded
  // with all published works, so this costs nothing.
  const siblings = tenant.works.filter((w) => w.type === work.type);
  const index = siblings.findIndex((w) => w.id === work.id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    headline: work.title,
    url: `${tenantUrl(slug)}/works/${id}`,
    inLanguage: work.lang,
    ...(work.publishedAt ? { datePublished: work.publishedAt } : {}),
    ...(work.excerpt ? { abstract: work.excerpt } : {}),
    author: { "@type": "Person", name: tenant.displayName, url: tenantUrl(slug) },
    isPartOf: { "@type": "WebSite", name: tenant.displayName, url: tenantUrl(slug) },
  };

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
      <article style={{ maxWidth: 680, margin: "0 auto", padding: "4rem 1.5rem 5rem" }}>
        <a href="/" style={{ color: palette.accent, textDecoration: "none", fontSize: "0.9rem" }}>
          &larr; {tenant.displayName}
        </a>

        <h1
          lang={work.lang !== "en" ? work.lang : undefined}
          style={{ fontFamily: font, fontSize: "2.5rem", margin: "1.5rem 0 0.5rem" }}
        >
          {work.title}
        </h1>
        {date ? (
          <p style={{ color: palette.muted, fontSize: "0.9rem", margin: 0 }}>{date}</p>
        ) : null}

        <div
          aria-hidden
          style={{
            margin: "1.75rem 0 2.25rem",
            color: palette.accent,
            opacity: 0.5,
            letterSpacing: "0.6em",
          }}
        >
          &#10086;&#xfe0e;
        </div>

        {work.coverUrl ? (
          <img
            src={work.coverUrl}
            alt=""
            style={{ width: "100%", borderRadius: 16, marginBottom: "2.5rem" }}
          />
        ) : null}

        <div
          className="work-body"
          lang={work.lang !== "en" ? work.lang : undefined}
          style={{ fontFamily: font, fontSize: "1.1rem", lineHeight: 1.85 }}
        >
          <ReactMarkdown>{work.body}</ReactMarkdown>
        </div>

        <nav
          aria-label={`More ${GENRE_LABELS[work.type].toLowerCase()} by ${tenant.displayName}`}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem", marginTop: "3.5rem" }}
        >
          {/* Every work gets two cards (uniform footer); missing neighbours
              become "Back to home". A lone work gets one full-width home card. */}
          {!prev && !next ? (
            <NavCard
              href="/"
              eyebrow="← Back to home"
              title={tenant.displayName}
              align="left"
              palette={palette}
              font={font}
            />
          ) : (
            <>
              {prev ? (
                <NavCard
                  href={`/works/${prev.id}`}
                  eyebrow="← Previous"
                  title={prev.title}
                  lang={prev.lang}
                  align="left"
                  palette={palette}
                  font={font}
                />
              ) : (
                <NavCard
                  href="/"
                  eyebrow="← Back to home"
                  title={tenant.displayName}
                  align="left"
                  palette={palette}
                  font={font}
                />
              )}
              {next ? (
                <NavCard
                  href={`/works/${next.id}`}
                  eyebrow="Next →"
                  title={next.title}
                  lang={next.lang}
                  align="right"
                  palette={palette}
                  font={font}
                />
              ) : (
                <NavCard
                  href="/"
                  eyebrow="Back to home →"
                  title={tenant.displayName}
                  align="right"
                  palette={palette}
                  font={font}
                />
              )}
            </>
          )}
        </nav>
      </article>
    </main>
  );
}
