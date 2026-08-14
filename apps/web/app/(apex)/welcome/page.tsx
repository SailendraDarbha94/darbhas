import type { Metadata } from "next";
import { SITE_DOMAIN, apexUrl } from "@/lib/tenant-host";
import { SiteFooter } from "@/components/site-footer";
import { WelcomeForm } from "./welcome-form";

export const metadata: Metadata = {
  title: "Welcome — set up your login",
  description: `Set the password for your new ${SITE_DOMAIN} writer account.`,
  alternates: { canonical: `${apexUrl()}/welcome` },
  robots: { index: false },
};

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen flex-col text-[#2b2620]">
      <div aria-hidden className="apex-ground" />

      <div className="mx-auto w-full max-w-xl flex-1 px-6 pt-20 pb-16">
        <a href="/" className="text-sm text-[#b0713b] hover:underline">
          &larr; {SITE_DOMAIN}
        </a>
        <h1 className="mt-4 font-[family-name:var(--font-serif)] text-4xl font-medium tracking-tight">
          Welcome to the family
        </h1>
        <p className="mt-3 leading-relaxed text-[#7d7468]">
          Your application was approved. Choose a password and your writer studio is ready.
        </p>

        <div className="glass-panel mt-8 p-8 sm:p-10">
          <WelcomeForm />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
