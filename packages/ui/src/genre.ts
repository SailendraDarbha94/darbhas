import type { WorkType } from "@darbha/types";

export const GENRE_LABELS: Record<WorkType, string> = {
  poem: "Poetry",
  play: "Plays",
  talk: "Talks",
  travel: "Travel writing",
  essay: "Essays",
  other: "Writing",
};

/**
 * Decorative typographic glyphs used on cards and section headers.
 * \ufe0e forces text presentation so they don't render as color emoji.
 */
export const GENRE_GLYPHS: Record<WorkType, string> = {
  poem: "\u270e\ufe0e", // ✎
  play: "\u2767\ufe0e", // ❧
  talk: "\u275e\ufe0e", // ❞
  travel: "\u2708\ufe0e", // ✈
  essay: "\u00b6\ufe0e", // ¶
  other: "\u2766\ufe0e", // ❦
};
