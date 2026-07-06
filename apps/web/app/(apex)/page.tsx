import type { Metadata } from "next";
import type { TenantTheme } from "@darbha/types";
import { TenantCard } from "@darbha/ui";
import { getTenants } from "@/lib/api";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Darbha — a family of writers",
};

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

export default async function ApexPage() {
  let tenants: Awaited<ReturnType<typeof getTenants>> = [];
  let apiDown = false;
  try {
    tenants = await getTenants();
  } catch {
    apiDown = true;
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] text-[#2b2620]">
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b0713b]">
          One surname, many voices
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-5xl sm:text-6xl">Darbha</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#7d7468]">
          A family of writers. Poetry, plays, and travel essays — each Darbha with their own corner
          of the internet, under one roof.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-6 font-[family-name:var(--font-serif)] text-2xl">The Darbhas, so far</h2>
        {apiDown ? (
          <p className="rounded-xl border border-dashed border-[#b0713b]/40 p-8 text-center text-[#7d7468]">
            The gallery is waking up — check back in a moment.
          </p>
        ) : tenants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#b0713b]/40 p-8 text-center text-[#7d7468]">
            No writers hosted yet. Be the first — apply below.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={{ ...tenant, theme: tenant.theme as TenantTheme }}
                href={`https://${tenant.slug}.${SITE_DOMAIN}`}
              />
            ))}
          </div>
        )}
      </section>

      <section id="apply" className="border-t border-[#b0713b]/15 bg-white/60">
        <div className="mx-auto max-w-xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl">Are you a Darbha?</h2>
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
        {SITE_DOMAIN} — kept by the family
      </footer>
    </main>
  );
}
