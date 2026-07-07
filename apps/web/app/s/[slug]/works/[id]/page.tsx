import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { TenantTheme } from "@darbha/types";
import { fontFamilyFor, formatDate, paletteFor } from "@darbha/ui";
import { ApiError, getTenantBySlug } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

async function load({ params }: Props) {
  const { slug, id } = await params;
  try {
    const tenant = await getTenantBySlug(slug);
    const work = tenant.works.find((w) => w.id === id);
    if (!work) return null;
    return { tenant, work };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props);
  if (!data) return { title: "Not found" };
  return {
    title: `${data.work.title} — ${data.tenant.displayName}`,
    description: data.work.excerpt ?? undefined,
  };
}

export default async function WorkPage(props: Props) {
  const data = await load(props);
  if (!data) notFound();

  const { tenant, work } = data;
  const theme = tenant.theme as TenantTheme;
  const palette = paletteFor(theme);
  const font = fontFamilyFor(theme);

  const date = work.publishedAt ? formatDate(work.publishedAt) : null;

  return (
    <main style={{ minHeight: "100vh", background: palette.bg, color: palette.text }}>
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
      </article>
    </main>
  );
}
