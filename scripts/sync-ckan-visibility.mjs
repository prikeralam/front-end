// Populates Prisma's DatasetVisibilityOverride from CKAN's current packages,
// using each package's `pri_visibility_tier` extra (set by pri-ckan's
// seed_datasets.py) as the initial tier. Run this once after seeding CKAN,
// and again any time a dataset is added directly in CKAN without going
// through the (future) admin UI that will write this table directly.
//
// Usage: node scripts/sync-ckan-visibility.mjs
// Requires CKAN_URL and CKAN_API_KEY (reads .env.local via --env-file, or
// export them yourself first).

import { PrismaClient } from "@prisma/client";

const CKAN_URL = process.env.CKAN_URL ?? "http://localhost:5000";
const CKAN_API_KEY = process.env.CKAN_API_KEY;

const TIER_MAP = { public: "public", "on-request": "on_request", internal: "internal" };

async function main() {
  if (!CKAN_API_KEY) {
    console.error("CKAN_API_KEY is not set.");
    process.exit(1);
  }

  const res = await fetch(`${CKAN_URL}/api/3/action/package_search?rows=1000&include_private=true`, {
    headers: { Authorization: CKAN_API_KEY },
  });
  const body = await res.json();
  if (!body.success) {
    console.error("CKAN package_search failed:", body);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  let count = 0;
  for (const pkg of body.result.results) {
    const extraTier = pkg.extras?.find((e) => e.key === "pri_visibility_tier")?.value;
    const tier = TIER_MAP[extraTier] ?? (pkg.private ? "internal" : "public");
    await prisma.datasetVisibilityOverride.upsert({
      where: { ckanSlug: pkg.name },
      create: { ckanSlug: pkg.name, tier },
      update: { tier },
    });
    console.log(`  ${pkg.name}: ${tier}`);
    count++;
  }
  await prisma.$disconnect();
  console.log(`Synced ${count} datasets.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
