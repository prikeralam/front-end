/**
 * Seconds until a JWT's `exp` claim, or `null` if the token has no readable expiry. The payload is decoded without
 * verifying the signature: this only sizes the cookie's lifetime. The backend verifies every token it receives.
 */
export function secondsUntilExpiry(token: string, nowMs: number = Date.now()): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const exp = claims && typeof claims === "object" ? (claims as { exp?: unknown }).exp : undefined;
    return typeof exp === "number" ? Math.max(0, Math.floor(exp - nowMs / 1000)) : null;
  } catch {
    return null;
  }
}
