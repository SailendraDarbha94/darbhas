import "dotenv/config";
import { createPrismaClient } from "../src";
import { baburaoPoems, baburaoTalks } from "./baburao-content";

const prisma = createPrismaClient();

async function main() {
  const phanindraData = {
    displayName: "Sai Phanindra Darbha",
    tagline: "Poems, mostly at night",
    genre: "poem" as const,
    bio: "Poetry on memory, monsoons, and everything in between.",
    theme: { preset: "plum", fontStyle: "serif" },
  };
  const phanindra = await prisma.tenant.upsert({
    where: { slug: "phanindra" },
    update: phanindraData,
    create: { slug: "phanindra", ...phanindraData },
  });

  const sailendraData = {
    displayName: "Sailendra Darbha",
    tagline: "Notes from the road",
    genre: "travel" as const,
    bio: "I write about the places I wander through and the people I meet along the way.",
    theme: { preset: "sand", fontStyle: "sans" },
  };
  const sailendra = await prisma.tenant.upsert({
    where: { slug: "sailendra" },
    update: sailendraData,
    create: { slug: "sailendra", ...sailendraData },
  });

  // The placeholder grandfather tenant from the first seed, replaced by baburao.
  await prisma.tenant.deleteMany({ where: { slug: "kameswara" } });

  const baburaoProfile = {
    roles: ["Educator", "Scholar", "Poet", "Playwright"],
    born: { date: "9th February, 1946", place: "Bapatla, Andhra Pradesh" },
    parents: {
      father: "Late Sri Darbha Lakshmi Narayana Sastry",
      mother: "Late Smt. Darbha Jwala Annapurna Visalakshi",
    },
    education: [
      {
        period: "Elementary",
        title: "Mamillapalli Sitaramaiah Elementary School",
        detail: "Bapatla, AP",
      },
      { period: "High School", title: "Board/Municipal High School", detail: "Bapatla, AP" },
      {
        period: "Pre-University (PUC)",
        title: "VRS & YRN College of Arts and Science",
        detail: "Chirala, AP",
      },
      { period: "Graduation (B.Com)", title: "C S R Sarma College", detail: "Ongole, AP" },
      {
        period: "Post-Graduation (M.Com)",
        title: "Andhra University",
        detail: "Visakhapatnam, AP",
      },
    ],
    career: [
      {
        period: "1998 – 2004",
        title: "Head of Department of Commerce",
        detail: "The Bapatla College of Arts & Sciences, Bapatla (AP)",
      },
      {
        period: "Retired 2004",
        title: "Vice-Principal",
        detail: "The Bapatla College of Arts & Sciences, Bapatla (AP)",
      },
    ],
  };

  const grandfather = await prisma.tenant.upsert({
    where: { slug: "baburao" },
    update: { profile: baburaoProfile },
    create: {
      slug: "baburao",
      displayName: "Darbha Babu Rao",
      tagline: "Poems and plays, in Telugu",
      genre: "poem",
      bio: "Educator and scholar from Bapatla who spent a lifetime teaching commerce — and writing Telugu poetry and plays for the family stage.",
      theme: { preset: "ink", fontStyle: "serif" },
      profile: baburaoProfile,
    },
  });

  // Idempotency: remove previously-seeded works (matched by title) before re-inserting.
  const seededTitles = [
    "Three Days in Hampi",
    "Monsoon Arithmetic",
    "The Clerk of Rajahmundry",
    ...baburaoPoems.map((w) => w.title),
    ...baburaoTalks.map((w) => w.title),
    // Legacy placeholder — removed once full text is available in poetry.ts
    "నేనూ ఒక కవినేనా",
  ];
  await prisma.work.deleteMany({
    where: {
      tenantId: { in: [phanindra.id, sailendra.id, grandfather.id] },
      title: { in: seededTitles },
    },
  });

  await prisma.work.createMany({
    data: [
      {
        tenantId: sailendra.id,
        type: "travel",
        title: "Three Days in Hampi",
        excerpt: "Boulders, ruins, and a river that has seen empires come and go.",
        body: "# Three Days in Hampi\n\nThe bus dropped me off before sunrise...",
        tags: ["india", "karnataka"],
        published: true,
        publishedAt: new Date(),
        sortOrder: 1,
      },
      {
        tenantId: phanindra.id,
        type: "poem",
        title: "Monsoon Arithmetic",
        excerpt: "A poem about counting rains.",
        body: "The first rain divides the year in two,\nthe second multiplies the frogs...",
        tags: ["monsoon"],
        published: true,
        publishedAt: new Date(),
        sortOrder: 1,
      },
      // Babu Rao — Telugu poems and talks (from darbha-baburao-web-dashboard)
      ...baburaoPoems.map((work) => ({
        tenantId: grandfather.id,
        type: "poem" as const,
        lang: "te",
        title: work.title,
        excerpt: work.excerpt,
        body: work.body,
        published: true,
        publishedAt: new Date(),
        sortOrder: work.sortOrder,
      })),
      ...baburaoTalks.map((work) => ({
        tenantId: grandfather.id,
        type: "talk" as const,
        lang: "te",
        title: work.title,
        excerpt: work.excerpt,
        body: work.body,
        published: true,
        publishedAt: new Date(),
        sortOrder: work.sortOrder,
      })),
    ],
    skipDuplicates: true,
  });

  console.log("Seeded tenants:", phanindra.slug, sailendra.slug, grandfather.slug);
  console.log("Grandfather works:", await prisma.work.count({ where: { tenantId: grandfather.id } }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
