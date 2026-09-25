// Regenerates app/_lib/api/schema.d.ts from the backend's OpenAPI contract.
// API_SCHEMA may be a file path or a URL (e.g. http://localhost:8000/api/schema/);
// it defaults to the sibling backend checkout's committed snapshot.
import { spawnSync } from "node:child_process";

const schema = process.env.API_SCHEMA ?? "../backend/docs/api/openapi.yaml";
const output = "app/_lib/api/schema.d.ts";

const result = spawnSync("npx", ["openapi-typescript", schema, "-o", output], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
