import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { apexUrl } from "@/lib/tenant-host";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "The house rules for darbha.info and its subdomains.",
  alternates: { canonical: `${apexUrl()}/terms` },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms &amp; conditions" lastUpdated="July 2026">
      <p>
        darbha.info hosts the writing of the Darbha family — poetry, plays, talks, travel writing
        and essays — with each writer on their own subdomain. By using the site you agree to these
        (mercifully short) terms.
      </p>

      <h2>The writing belongs to its writers</h2>
      <p>
        Every poem, play, talk and essay on this site remains the property of its author or their
        estate. You&apos;re welcome to read, quote briefly with attribution, and share links — but
        please don&apos;t republish whole works without permission from the family.
      </p>

      <h2>Applying for a subdomain</h2>
      <ul>
        <li>Subdomains are intended for members of the Darbha family who write.</li>
        <li>Give truthful information in your application.</li>
        <li>
          Applications are reviewed by the family and may be approved or declined at our
          discretion; subdomain names are first-come, subject to the reserved list.
        </li>
      </ul>

      <h2>Writers are responsible for their pages</h2>
      <p>
        Each writer manages their own works and is responsible for what they publish. We may
        unpublish content or suspend a site that is unlawful, hateful, or clearly outside the
        spirit of a family literary archive.
      </p>

      <h2>The service, as-is</h2>
      <p>
        This is a labour of love, not a commercial product. The site is provided as-is, without
        warranties; we may change, interrupt, or retire features — though the family&apos;s
        writing is precisely what we intend to preserve.
      </p>

      <h2>Questions</h2>
      <p>
        Anything unclear? Reach out through the family, or via the application form on the home
        page.
      </p>
    </LegalPage>
  );
}
