#!/usr/bin/env node
// Runs before `next dev`/`next start` — starts the local Postgres this repo's
// Prisma layer needs (docker-compose.yml) and the sibling pri-ckan stack.
// Without these, dataset/access-request routes fail with ECONNREFUSED.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ckanDir = path.resolve(repoRoot, "../pri-ckan");

const stacks = [
  { label: "pri-website-db", dir: repoRoot },
  { label: "pri-ckan", dir: ckanDir },
];

for (const { label, dir } of stacks) {
  if (!existsSync(path.join(dir, "docker-compose.yml"))) {
    console.warn(`[start-services] skipping ${label}: no docker-compose.yml at ${dir}`);
    continue;
  }
  try {
    execSync("docker compose up -d", { cwd: dir, stdio: "inherit" });
  } catch {
    console.warn(`[start-services] couldn't start ${label} — is Docker Desktop running? Continuing without it.`);
  }
}
