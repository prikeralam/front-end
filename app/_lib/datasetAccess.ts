import "server-only";
import type { NextRequest } from "next/server";

/**
 * Session/role helpers shared by the dataset API routes. Session handling is
 * still the mock from mockAuth.ts (localStorage, client-side, insecure) —
 * there is no real auth yet (Module H is future-phase). The client sends its
 * mock session as request headers so these route handlers can apply the same
 * role logic server-side. This header-trust boundary is exactly as insecure
 * as the rest of the mock and must be replaced wholesale once Module H
 * exists.
 */

export type Role = "public" | "researcher" | "editor" | "fellow" | "admin";

const REVIEWER_ROLES: Role[] = ["editor", "admin"];

export type MockRequestSession = { email: string; name: string; role: Role } | null;

export function readMockSession(req: NextRequest): MockRequestSession {
  const email = req.headers.get("x-pri-user-email");
  const name = req.headers.get("x-pri-user-name");
  const role = req.headers.get("x-pri-user-role") as Role | null;
  if (!email || !role) return null;
  return { email, name: name ?? email, role };
}

export function canReviewAccessRequests(session: MockRequestSession): session is NonNullable<MockRequestSession> {
  return !!session && REVIEWER_ROLES.includes(session.role);
}
