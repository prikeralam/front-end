import type { components } from "./schema";

type ApiAuditLog = components["schemas"]["AuditLog"];

export type AuditRow = {
  id: number;
  at: string;
  module: string;
  /** The API exposes only the actor's user id (backend gap G6). */
  actor: string;
  summary: string;
};

/** "status_transition" -> "status transition". */
const words = (value: string) => value.replace(/[_-]+/g, " ").trim();

const meta = (metadata: unknown, key: string): string | null => {
  const value = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>)[key] : undefined;
  return typeof value === "string" && value ? value : null;
};

/** "contentblock:4" -> "contentblock #4". */
const targetLabel = (target: string) => target.replace(/:(\d+)$/, " #$1");

/** A one-line, human description of what happened. Known actions read naturally; anything else falls back to generic. */
export function describeAuditEntry(entry: Pick<ApiAuditLog, "action" | "target" | "metadata">): string {
  const target = targetLabel(entry.target);
  const change = (from: string | null, to: string | null) => (from && to ? `from ${words(from)} to ${words(to)}` : to ? `to ${words(to)}` : "");

  switch (entry.action) {
    case "status_transition":
      return `Moved ${target} ${change(meta(entry.metadata, "previous_status"), meta(entry.metadata, "new_status"))}`.trim();
    case "role_change":
      return `Changed the role of ${target} ${change(meta(entry.metadata, "old_role"), meta(entry.metadata, "new_role"))}`.trim();
    case "access_request_review":
      return `Reviewed ${target}: ${change(meta(entry.metadata, "old_status"), meta(entry.metadata, "new_status"))}`.trim();
    default:
      return `${words(entry.action).replace(/^./, (c) => c.toUpperCase())} — ${target}`;
  }
}

export function toAuditRow(entry: ApiAuditLog): AuditRow {
  return {
    id: entry.id,
    at: entry.timestamp,
    module: entry.module,
    actor: `User #${entry.actor}`,
    summary: describeAuditEntry(entry),
  };
}
