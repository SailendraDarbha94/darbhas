const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

export default function TenantNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf7f0] px-6 text-center text-[#2b2620]">
      <h1 className="font-[family-name:var(--font-serif)] text-4xl">No one lives here yet</h1>
      <p className="mt-4 max-w-md text-[#7d7468]">
        This corner of {SITE_DOMAIN} hasn&apos;t been claimed. If you&apos;re a Darbha, it could be
        yours.
      </p>
      <a
        href={`https://${SITE_DOMAIN}/#apply`}
        className="mt-8 rounded-lg bg-[#b0713b] px-6 py-3 font-semibold text-white transition hover:bg-[#9a6233]"
      >
        Apply for this subdomain
      </a>
    </main>
  );
}
