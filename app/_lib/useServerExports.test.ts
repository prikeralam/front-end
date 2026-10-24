import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// A "use server" module may export only async functions. Anything else (a constant, a plain function) passes the build
// but throws when the module loads, so every action in that file fails at runtime: the applications inbox broke this
// way in production (#270). Types are fine, since they are erased.
const APP_DIR = path.resolve(__dirname, "..");
const ALLOWED = /^export (async function |type |interface )/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe('"use server" files', () => {
  it("export only async functions and types", () => {
    const offenders = sourceFiles(APP_DIR).flatMap((file) => {
      const text = readFileSync(file, "utf8");
      if (!/^\s*["']use server["'];?/.test(text)) return [];
      return text
        .split("\n")
        .map((line, i) => ({ line, at: `${path.relative(APP_DIR, file)}:${i + 1}` }))
        .filter(({ line }) => line.startsWith("export ") && !ALLOWED.test(line))
        .map(({ at, line }) => `${at} ${line.trim()}`);
    });
    expect(offenders).toEqual([]);
  });
});
