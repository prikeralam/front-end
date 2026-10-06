export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
    readonly path: string,
  ) {
    super(`API ${status} on ${path}: ${detail}`);
    this.name = "ApiError";
  }
}

/** Pulls a human-readable message out of DRF's `{detail}` or `{field: [msg]}` error bodies. */
export function describeErrorBody(body: unknown): string {
  if (!body || typeof body !== "object") return "Unknown error";
  const record = body as Record<string, unknown>;
  if (typeof record.detail === "string") return record.detail;

  const fieldMessages = Object.entries(record)
    .filter(([, value]) => Array.isArray(value))
    .map(([field, value]) => `${field}: ${(value as unknown[]).join(" ")}`);
  return fieldMessages.length ? fieldMessages.join("; ") : "Unknown error";
}
