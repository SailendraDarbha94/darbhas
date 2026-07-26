import type { Metadata } from "next";
import { SITE_DOMAIN, apexUrl } from "@/lib/tenant-host";
import { SiteFooter } from "@/components/site-footer";
import { ApplyForm } from "../apply-form";

export const metadata: Metadata = {
  title: "Apply for a subdomain",
  description: `Darbhas who write can apply for their own corner of ${SITE_DOMAIN}.`,
  alternates: { canonical: `${apexUrl()}/apply` },
};

export default function ApplyPage() {
  return (
    <main className="relative flex min-h-screen flex-col text-[#2b2620]">
      <div aria-hidden className="apex-ground" />

      <div className="mx-auto w-full max-w-xl flex-1 px-6 pt-20 pb-16">
        <a href="/" className="text-sm text-[#b0713b] hover:underline">
          &larr; {SITE_DOMAIN}
        </a>
        <h1 className="mt-4 font-[family-name:var(--font-serif)] text-4xl font-medium tracking-tight">
          Apply for a subdomain
        </h1>
        <p className="mt-3 leading-relaxed text-[#7d7468]">
          If you share the name and you write — poems, plays, essays, anything — this is how you
          get your own <span className="font-semibold text-[#2b2620]">yourname.{SITE_DOMAIN}</span>.
          The family reviews every application.
        </p>

        <div className="glass-panel mt-8 p-8 sm:p-10">
          <ApplyForm />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
