import type { CSSProperties } from "react";
import type { TenantTheme } from "@darbha/types";

/** Liquid-glass surface tokens — a frosted material that floats over `ground`. */
export interface Glass {
  /** Translucent fill layered over the backdrop blur. */
  surface: string;
  /** Slightly more opaque fill for nested/interactive surfaces (inputs). */
  surfaceStrong: string;
  /** Hairline border. */
  border: string;
  /** 1px specular highlight along a surface's top edge. */
  highlight: string;
  /** Backdrop blur radius, px. */
  blur: number;
  /** Soft layered drop shadow. */
  shadow: string;
}

export interface Palette {
  /** Page background (flat fallback). */
  bg: string;
  /** Card / surface background (opaque fallback). */
  surface: string;
  /** Primary text. */
  text: string;
  /** Secondary text. */
  muted: string;
  /** Accent (links, buttons, flourishes). */
  accent: string;
  /** Gradient pair used on gallery cards. */
  gradient: [string, string];
  /** True for dark themes — flips glass + text handling. */
  dark: boolean;
  /** Full-bleed gradient ground rendered behind glass so it has color to refract. */
  ground: string;
  /** Liquid-glass material tokens. */
  glass: Glass;
}

const LIGHT_GLASS: Glass = {
  surface: "rgba(255,255,255,0.55)",
  surfaceStrong: "rgba(255,255,255,0.72)",
  border: "rgba(255,255,255,0.6)",
  highlight: "rgba(255,255,255,0.9)",
  blur: 18,
  shadow: "0 1px 2px rgba(70,45,25,0.06), 0 22px 48px -24px rgba(70,45,25,0.5)",
};

const DARK_GLASS: Glass = {
  surface: "rgba(255,255,255,0.06)",
  surfaceStrong: "rgba(255,255,255,0.1)",
  border: "rgba(255,255,255,0.14)",
  highlight: "rgba(255,255,255,0.2)",
  blur: 22,
  shadow: "0 1px 2px rgba(0,0,0,0.35), 0 24px 52px -24px rgba(0,0,0,0.75)",
};

export const PALETTES: Record<TenantTheme["preset"], Palette> = {
  ivory: {
    bg: "#faf7f0",
    surface: "#ffffff",
    text: "#2b2620",
    muted: "#7d7468",
    accent: "#b0713b",
    gradient: ["#f5ead8", "#e8d5b5"],
    dark: false,
    ground:
      "radial-gradient(70% 55% at 10% 6%, #fdeeda 0%, transparent 58%), radial-gradient(60% 50% at 94% 2%, rgba(240,207,166,0.7) 0%, transparent 52%), radial-gradient(75% 65% at 90% 98%, rgba(227,180,140,0.45) 0%, transparent 56%), linear-gradient(160deg, #fcf6ec 0%, #f6e7d2 55%, #efd9bd 100%)",
    glass: LIGHT_GLASS,
  },
  ink: {
    bg: "#12141c",
    surface: "#1c1f2a",
    text: "#e8e6df",
    muted: "#8f92a1",
    accent: "#d4a531",
    gradient: ["#232738", "#101320"],
    dark: true,
    ground:
      "radial-gradient(70% 55% at 12% 8%, #2a2f45 0%, transparent 60%), radial-gradient(55% 50% at 92% 6%, #3a3020 0%, transparent 52%), radial-gradient(80% 75% at 85% 96%, #1a2036 0%, transparent 60%), linear-gradient(160deg, #15171f 0%, #10121b 60%, #0b0d15 100%)",
    glass: DARK_GLASS,
  },
  sage: {
    bg: "#f2f5ef",
    surface: "#ffffff",
    text: "#26302a",
    muted: "#6d7a70",
    accent: "#3f6f4f",
    gradient: ["#dcead9", "#b9d0b6"],
    dark: false,
    ground:
      "radial-gradient(70% 55% at 10% 6%, #e6f1e2 0%, transparent 58%), radial-gradient(60% 50% at 94% 4%, rgba(200,221,196,0.7) 0%, transparent 52%), radial-gradient(75% 65% at 90% 98%, rgba(169,201,168,0.4) 0%, transparent 56%), linear-gradient(160deg, #f5f8f2 0%, #e7f0e3 55%, #d7e7d4 100%)",
    glass: LIGHT_GLASS,
  },
  sand: {
    bg: "#fbf5ec",
    surface: "#ffffff",
    text: "#33291d",
    muted: "#87796a",
    accent: "#c26a3f",
    gradient: ["#f6e3c8", "#e9c9a0"],
    dark: false,
    ground:
      "radial-gradient(70% 55% at 12% 6%, #fbeada 0%, transparent 58%), radial-gradient(60% 50% at 94% 2%, rgba(243,211,172,0.65) 0%, transparent 52%), radial-gradient(75% 65% at 90% 98%, rgba(232,185,138,0.45) 0%, transparent 56%), linear-gradient(160deg, #fcf4e8 0%, #f6e2c9 55%, #eecfaa 100%)",
    glass: LIGHT_GLASS,
  },
  plum: {
    bg: "#f8f4f9",
    surface: "#ffffff",
    text: "#2e2233",
    muted: "#7c6f85",
    accent: "#7d4a8d",
    gradient: ["#ead9f0", "#cfb2da"],
    dark: false,
    ground:
      "radial-gradient(70% 55% at 10% 6%, #f1e6f5 0%, transparent 58%), radial-gradient(60% 50% at 94% 4%, rgba(220,195,230,0.7) 0%, transparent 52%), radial-gradient(75% 65% at 90% 98%, rgba(201,169,217,0.4) 0%, transparent 56%), linear-gradient(160deg, #f8f3fa 0%, #ede1f1 55%, #e0cfe8 100%)",
    glass: LIGHT_GLASS,
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

/** Core frosted-glass surface styles for a palette. Spread onto an element and add radius/padding. */
export function glassStyle(palette: Palette): CSSProperties {
  const g = palette.glass;
  return {
    background: g.surface,
    border: `1px solid ${g.border}`,
    backdropFilter: `blur(${g.blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${g.blur}px) saturate(180%)`,
    boxShadow: g.shadow,
  };
}
