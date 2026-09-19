#!/usr/bin/env node
// Runs before `next dev`/`next start` — starts the local Postgres this repo's
// Prisma layer needs (docker-compose.yml), for the access-request flow.
// pri-ckan is decommissioned (see CLAUDE.md's 2026-09-19 changelog entry) and
// no longer started here; datasets are served from app/_content/datasets.ts.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const stacks = [{ label: "pri-website-db", dir: repoRoot }];

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
