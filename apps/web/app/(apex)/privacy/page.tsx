import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { apexUrl } from "@/lib/tenant-host";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How darbha.info handles the little data it collects.",
  alternates: { canonical: `${apexUrl()}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" lastUpdated="July 2026">
      <p>
        darbha.info is a family-run website that publishes the writing of members of the Darbha
        family. We collect as little personal information as we can get away with, and this page
        explains all of it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Subdomain applications.</strong> When you apply for a subdomain we collect your
          name, requested subdomain, email address, what you write, and an optional message. We
          use this only to review the application and reply to you.
        </li>
        <li>
          <strong>Writer accounts.</strong>{" "}Family members who manage a site sign in with an email
          address and password. Published works appear under the writer&apos;s name — that is the
          point of the site.
        </li>
        <li>
          <strong>Server logs.</strong> Our hosting providers keep standard technical logs
          (IP address, browser type, pages requested) to run and secure the service.
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>No advertising, no analytics trackers, no marketing emails.</li>
        <li>No selling or sharing of your information with anyone for their own use.</li>
        <li>
          No cookies, except the session cookie that keeps writers and admins signed in to the
          dashboard. Visitors reading the site get none.
        </li>
      </ul>

      <h2>Where your data lives</h2>
      <p>
        Content and accounts are stored with Supabase (our database and authentication provider).
        The website is served by Vercel and our API by Render. These providers process data on
        our behalf to run the site, and nothing more.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to delete your application or account data at any time, and writers can ask
        for their works or site to be unpublished — reach out through the family or reply to any
        email we&apos;ve sent you about your application.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, we&apos;ll update this page and the date at the top. Meaningful
        changes will be flagged on the home page.
      </p>
    </LegalPage>
  );
}
