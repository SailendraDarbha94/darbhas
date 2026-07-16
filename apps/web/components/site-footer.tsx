const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

/**
 * Shared footer for apex pages (home, privacy, terms). Brand block + link
 * columns over the warm glass ground, in the reference layout of
 * brand | columns / divider / copyright.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[#b0713b]/15 bg-white/40 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <a href="/" className="flex items-baseline gap-2 text-[#2b2620] no-underline">
              <span aria-hidden className="text-[#b0713b]/70">&#10086;&#xfe0e;</span>
              <span className="font-[family-name:var(--font-serif)] text-2xl font-medium">
                Darbha
              </span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-[#7d7468]">
              A legacy of writers, travellers &amp; narrators — each with their own corner of the
              internet, under one roof.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#b0713b]">
                Family
              </h2>
              <ul className="space-y-3 text-sm text-[#7d7468]">
                <li>
                  <a href="/" className="hover:text-[#2b2620] hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/#apply" className="hover:text-[#2b2620] hover:underline">
                    Apply for a subdomain
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#b0713b]">
                More
              </h2>
              <ul className="space-y-3 text-sm text-[#7d7468]">
                <li>
                  <a href="/admin" className="hover:text-[#2b2620] hover:underline">
                    Admin login
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#b0713b]">
                Legal
              </h2>
              <ul className="space-y-3 text-sm text-[#7d7468]">
                <li>
                  <a href="/privacy" className="hover:text-[#2b2620] hover:underline">
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-[#2b2620] hover:underline">
                    Terms &amp; conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-[#b0713b]/25 to-transparent" />

        <p className="text-center text-sm text-[#7d7468]">
          &copy; {new Date().getFullYear()} {SITE_DOMAIN} — kept by the family
          <span aria-hidden className="mx-2 text-[#b0713b]/60">&#10086;&#xfe0e;</span>
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
