import type { Metadata } from "next";
import type { TenantTheme } from "@darbha/types";
import { TenantCard } from "@darbha/ui";
import { getTenants } from "@/lib/api";
import { SITE_DOMAIN, apexUrl } from "@/lib/tenant-host";
import { ApplyForm } from "./apply-form";

const TITLE = "Darbha — a legacy of writers, travellers & narrators";
const DESCRIPTION =
  "The Darbha family writes: poetry, plays, travel essays. One surname, many voices, each with their own corner of the internet.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: apexUrl() },
  openGraph: {
    type: "website",
    url: apexUrl(),
    siteName: "Darbha",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/** The grandfather's memorial site leads the gallery. */
const FEATURED_SLUG = "baburao";

export default async function ApexPage() {
  let tenants: Awaited<ReturnType<typeof getTenants>> = [];
  let apiDown = false;
  try {
    tenants = await getTenants();
  } catch {
    apiDown = true;
  }

  // Feature Darbha Babu Rao first, then the rest in their existing order.
  const ordered = [
    ...tenants.filter((t) => t.slug === FEATURED_SLUG),
    ...tenants.filter((t) => t.slug !== FEATURED_SLUG),
  ];

  return (
    <main className="relative min-h-screen text-[#2b2620]">
      <div aria-hidden className="apex-ground" />

      <section className="mx-auto max-w-5xl px-6 pt-24 pb-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b0713b]">
          One surname &middot; many voices
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-serif)] text-6xl font-medium tracking-tight sm:text-7xl">
          Darbha
        </h1>
        <div aria-hidden className="mt-5 text-xl tracking-[0.5em] text-[#b0713b]/60">
          &#10086;&#xfe0e;
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#7d7468]">
          A legacy of writers, travellers &amp; narrators. Poetry, plays, and travel essays — each
          Darbha with their own corner of the internet, under one roof.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="mb-8 flex items-baseline gap-4">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl font-medium">
            The Darbhas, so far
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#b0713b]/30 to-transparent" />
        </div>
        {apiDown ? (
          <div className="glass-panel p-8 text-center text-[#7d7468]">
            The gallery is waking up — check back in a moment.
          </div>
        ) : ordered.length === 0 ? (
          <div className="glass-panel p-8 text-center text-[#7d7468]">
            No writers hosted yet. Be the first — apply below.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={{ ...tenant, theme: tenant.theme as TenantTheme }}
                href={`https://${tenant.slug}.${SITE_DOMAIN}`}
              />
            ))}
          </div>
        )}
      </section>

      <section id="apply" className="mx-auto max-w-xl px-6 pb-24">
        <div className="glass-panel p-8 sm:p-10">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl font-medium">
            Are you a Darbha?
          </h2>
          <p className="mt-3 leading-relaxed text-[#7d7468]">
            If you share the name and you write — poems, plays, essays, anything — apply for your
            own <span className="font-semibold text-[#2b2620]">yourname.{SITE_DOMAIN}</span>.
          </p>
          <div className="mt-8">
            <ApplyForm />
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-[#7d7468]">
        <span aria-hidden className="mr-2 text-[#b0713b]/60">&#10086;&#xfe0e;</span>
        {SITE_DOMAIN} — kept by the family
      </footer>
    </main>
  );
}
