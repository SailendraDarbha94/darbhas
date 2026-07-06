import "dotenv/config";
import { createPrismaClient } from "../src";

const prisma = createPrismaClient();

async function main() {
  const phanindra = await prisma.tenant.upsert({
    where: { slug: "phanindra" },
    update: {},
    create: {
      slug: "phanindra",
      displayName: "Phanindra Darbha",
      tagline: "Notes from the road",
      genre: "travel",
      bio: "I write about the places I wander through and the people I meet along the way.",
      theme: { preset: "sand", fontStyle: "sans" },
    },
  });

  const sailendra = await prisma.tenant.upsert({
    where: { slug: "sailendra" },
    update: {},
    create: {
      slug: "sailendra",
      displayName: "Sailendra Darbha",
      tagline: "Poems, mostly at night",
      genre: "poem",
      bio: "Poetry on memory, monsoons, and everything in between.",
      theme: { preset: "plum", fontStyle: "serif" },
    },
  });

  const grandfather = await prisma.tenant.upsert({
    where: { slug: "kameswara" },
    update: {},
    create: {
      slug: "kameswara",
      displayName: "Kameswara Darbha",
      tagline: "Plays for the family stage",
      genre: "play",
      bio: "A lifetime of plays, written between careers and continents.",
      theme: { preset: "ink", fontStyle: "serif" },
    },
  });

  await prisma.work.createMany({
    data: [
      {
        tenantId: phanindra.id,
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
        tenantId: sailendra.id,
        type: "poem",
        title: "Monsoon Arithmetic",
        excerpt: "A poem about counting rains.",
        body: "The first rain divides the year in two,\nthe second multiplies the frogs...",
        tags: ["monsoon"],
        published: true,
        publishedAt: new Date(),
        sortOrder: 1,
      },
      {
        tenantId: grandfather.id,
        type: "play",
        title: "The Clerk of Rajahmundry",
        excerpt: "A two-act play about a clerk who refuses a bribe and pays for it.",
        body: "## Act I, Scene 1\n\n*A government office. Ceiling fans turn slowly.*",
        tags: ["two-act", "telugu"],
        published: true,
        publishedAt: new Date(),
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded tenants:", phanindra.slug, sailendra.slug, grandfather.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
