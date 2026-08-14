import { googleFontHref } from "@darbha/ui";

/**
 * Loads a tenant's curated Google font on their public pages. googleFontHref
 * returns null for any family outside the whitelist, so stored junk can never
 * reach the fonts URL. React hoists these tags into <head>.
 */
export function TenantFontLinks({ font }: { font?: string }) {
  const href = googleFontHref(font);
  if (!href) return null;
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={href} precedence="default" />
    </>
  );
}
