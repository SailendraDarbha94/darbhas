/**
 * Regenerates prisma/baburao-content.ts from the legacy dashboard repo.
 *
 *   pnpm --filter @darbha/db exec tsx scripts/import-baburao-content.ts
 *
 * Default source: ../darbha-baburao-web-dashboard (sibling of darbhas).
 * Override: BABURAO_SOURCE=/path/to/darbha-baburao-web-dashboard
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

const sourceRoot =
  process.env.BABURAO_SOURCE ??
  resolve(import.meta.dirname, "../../../darbha-baburao-web-dashboard");

const { poems } = await import(`${sourceRoot}/src/lib/poetry.ts`);
const { plays } = await import(`${sourceRoot}/src/lib/talks.ts`);

function sectionsToBody(sections: string[]) {
  return sections.map((s) => s.replace(/\r\n/g, "\n").trim()).filter(Boolean).join("\n\n");
}

function excerptText(s: string) {
  return s.replace(/\n+/g, " ").trim();
}

const talkOrder: { match: (p: { title: string }) => boolean; title: string }[] = [
  {
    match: (p) => p.title.includes("అపార"),
    title: "అనుకున్నంత తేలిక కాదు… అపార్డుమెంటు కాపురం",
  },
  { match: (p) => p.title === "ఊరేగింపు", title: "ఊరేగింపు" },
  { match: (p) => p.title.includes("వడ్డన"), title: "వడ్డన కూడా ఒక కళే" },
];

const data = {
  poems: (poems as { title: string; excerpt: string; content: string[] }[]).map((p, i) => ({
    title: p.title,
    excerpt: excerptText(p.excerpt),
    body: sectionsToBody(p.content),
    sortOrder: i + 1,
  })),
  talks: talkOrder.map((spec, i) => {
    const play = (plays as { title: string; description: string; content: string[] }[]).find(
      spec.match,
    );
    if (!play) throw new Error(`Missing talk: ${spec.title}`);
    return {
      title: spec.title,
      excerpt: play.description ? excerptText(play.description) : undefined,
      body: sectionsToBody(play.content),
      sortOrder: i + 1,
    };
  }),
};

const outPath = resolve(import.meta.dirname, "../prisma/baburao-content.ts");
const helper = `
export function sectionsToBody(sections: string[]): string {
  return sections
    .map((s) => s.replace(/\\r\\n/g, "\\n").trim())
    .filter(Boolean)
    .join("\\n\\n");
}
`;

const src = `/** Telugu works imported from darbha-baburao-web-dashboard. Regenerate: pnpm --filter @darbha/db exec tsx scripts/import-baburao-content.ts */
export interface BaburaoWorkSeed {
  title: string;
  excerpt?: string;
  body: string;
  sortOrder: number;
}

export const baburaoPoems: BaburaoWorkSeed[] = ${JSON.stringify(data.poems, null, 2)};

export const baburaoTalks: BaburaoWorkSeed[] = ${JSON.stringify(data.talks, null, 2)};
${helper}`;

writeFileSync(outPath, src);
console.log(`Wrote ${outPath}: ${data.poems.length} poem(s), ${data.talks.length} talk(s)`);
