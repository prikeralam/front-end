import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// PRI's copy uses commas, colons or a plain hyphen instead of em dashes (stakeholder request, 2026-10-08).
// The generated API types are excluded; they mirror the backend's schema descriptions.
const APP_DIR = path.resolve(__dirname, "..");
const EM_DASH = String.fromCharCode(0x2014);
const SKIP = new Set(["schema.d.ts"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) && !SKIP.has(entry.name) ? [full] : [];
  });
}

describe("site copy", () => {
  it("contains no em dashes", () => {
    const offenders = sourceFiles(APP_DIR).filter((file) => readFileSync(file, "utf8").includes(EM_DASH));
    expect(offenders.map((file) => path.relative(APP_DIR, file))).toEqual([]);
  });
});
