import type { TenantTheme } from "@darbha/types";

export interface Palette {
  /** Page background. */
  bg: string;
  /** Card / surface background. */
  surface: string;
  /** Primary text. */
  text: string;
  /** Secondary text. */
  muted: string;
  /** Accent (links, buttons, flourishes). */
  accent: string;
  /** Gradient pair used on gallery cards. */
  gradient: [string, string];
}

export const PALETTES: Record<TenantTheme["preset"], Palette> = {
  ivory: {
    bg: "#faf7f0",
    surface: "#ffffff",
    text: "#2b2620",
    muted: "#7d7468",
    accent: "#b0713b",
    gradient: ["#f5ead8", "#e8d5b5"],
  },
  ink: {
    bg: "#12141c",
    surface: "#1c1f2a",
    text: "#e8e6df",
    muted: "#8f92a1",
    accent: "#d4a531",
    gradient: ["#232738", "#101320"],
  },
  sage: {
    bg: "#f2f5ef",
    surface: "#ffffff",
    text: "#26302a",
    muted: "#6d7a70",
    accent: "#3f6f4f",
    gradient: ["#dcead9", "#b9d0b6"],
  },
  sand: {
    bg: "#fbf5ec",
    surface: "#ffffff",
    text: "#33291d",
    muted: "#87796a",
    accent: "#c26a3f",
    gradient: ["#f6e3c8", "#e9c9a0"],
  },
  plum: {
    bg: "#f8f4f9",
    surface: "#ffffff",
    text: "#2e2233",
    muted: "#7c6f85",
    accent: "#7d4a8d",
    gradient: ["#ead9f0", "#cfb2da"],
  },
};

export function paletteFor(theme: TenantTheme | null | undefined): Palette {
  const base = PALETTES[theme?.preset ?? "ivory"] ?? PALETTES.ivory;
  return theme?.accent ? { ...base, accent: theme.accent } : base;
}

export function fontFamilyFor(theme: TenantTheme | null | undefined): string {
  return theme?.fontStyle === "sans"
    ? "var(--font-sans, ui-sans-serif, system-ui, sans-serif)"
    : "var(--font-serif, Georgia, 'Times New Roman', serif)";
}
