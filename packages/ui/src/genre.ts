import type { WorkType } from "@darbha/types";

export const GENRE_LABELS: Record<WorkType, string> = {
  poem: "Poetry",
  play: "Plays",
  travel: "Travel writing",
  essay: "Essays",
  other: "Writing",
};

/** Decorative typographic glyphs used on cards and section headers. */
export const GENRE_GLYPHS: Record<WorkType, string> = {
  poem: "\u270e", // ✎
  play: "\u2767", // ❧
  travel: "\u2708", // ✈
  essay: "\u00b6", // ¶
  other: "\u2766", // ❦
};
