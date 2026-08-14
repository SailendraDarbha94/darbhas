/**
 * Curated Google Fonts writers can pick for their site's Latin text.
 * This whitelist is the security boundary: font URLs are only ever built
 * from entries here, so arbitrary `theme.font` values can't inject into the
 * fonts.googleapis.com URL — unknown families are simply ignored.
 *
 * Telugu text is unaffected by any choice here: the `[lang="te"]` rule in
 * the web app forces Noto Serif Telugu with !important.
 */

export interface SiteFont {
  /** Exact Google Fonts family name (also the value stored in theme.font). */
  family: string;
  label: string;
  category: "serif" | "sans";
  /** css2 axis spec for the weights the site actually uses. */
  weights: string;
}

export const SITE_FONTS: SiteFont[] = [
  { family: "Fraunces", label: "Fraunces", category: "serif", weights: "wght@400;600;700" },
  { family: "Playfair Display", label: "Playfair Display", category: "serif", weights: "wght@400;600;700" },
  { family: "Lora", label: "Lora", category: "serif", weights: "wght@400;600;700" },
  { family: "Cormorant Garamond", label: "Cormorant Garamond", category: "serif", weights: "wght@500;600;700" },
  { family: "EB Garamond", label: "EB Garamond", category: "serif", weights: "wght@400;600;700" },
  { family: "Crimson Pro", label: "Crimson Pro", category: "serif", weights: "wght@400;600;700" },
  { family: "Libre Baskerville", label: "Libre Baskerville", category: "serif", weights: "wght@400;700" },
  { family: "Work Sans", label: "Work Sans", category: "sans", weights: "wght@400;600;700" },
  { family: "Source Sans 3", label: "Source Sans 3", category: "sans", weights: "wght@400;600;700" },
  { family: "Karla", label: "Karla", category: "sans", weights: "wght@400;700" },
  { family: "Manrope", label: "Manrope", category: "sans", weights: "wght@400;700" },
  { family: "Nunito Sans", label: "Nunito Sans", category: "sans", weights: "wght@400;700" },
];

/** The whitelist entry for a family, or null when unknown/unset. */
export function siteFont(family: string | null | undefined): SiteFont | null {
  if (!family) return null;
  return SITE_FONTS.find((f) => f.family === family) ?? null;
}

/** Stylesheet URL for one whitelisted family; null for anything else. */
export function googleFontHref(family: string | null | undefined): string | null {
  const font = siteFont(family);
  if (!font) return null;
  return `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, "+")}:${font.weights}&display=swap`;
}

/** One combined stylesheet with every curated family — for picker previews. */
export function allFontsHref(): string {
  const families = SITE_FONTS.map(
    (f) => `family=${f.family.replace(/ /g, "+")}:${f.weights}`,
  ).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
