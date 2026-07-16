import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";

/** Shared shell for the legal pages: warm ground, glass panel, footer. */
export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col text-[#2b2620]">
      <div aria-hidden className="apex-ground" />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pt-20 pb-16">
        <a href="/" className="text-sm text-[#b0713b] hover:underline">
          &larr; darbha.info
        </a>
        <h1 className="mt-4 font-[family-name:var(--font-serif)] text-4xl font-medium tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#7d7468]">Last updated: {lastUpdated}</p>

        <div className="glass-panel legal-prose mt-8 p-8 sm:p-10">{children}</div>
      </div>

      <SiteFooter />
    </main>
  );
}
