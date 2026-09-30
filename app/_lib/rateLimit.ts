/**
 * A fixed-size, sliding-window limit kept in this server's memory. Enough for one Next server per environment (as on
 * EC2); it resets on restart, and the backend keeps its own ceiling as the backstop.
 */
export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: { limit: number; windowMs: number; maxKeys?: number }) {
  const hits = new Map<string, number[]>();

  return function allow(key: string, now = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.delete(key); // re-insert so the Map's order stays oldest-first
    hits.set(key, recent);
    if (hits.size > maxKeys) hits.delete(hits.keys().next().value!);
    return true;
  };
}
