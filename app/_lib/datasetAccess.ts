import "server-only";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { extraValue, type CkanPackage } from "./ckan";

/**
 * Server-side twin of app/_lib/mockAuth.ts's canAccessDataset — this is the
 * "Module C v0" enforcement point. CKAN only has public/private; the actual
 * public/on-request/internal tier lives in Prisma's
 * DatasetVisibilityOverride, keyed by CKAN slug. See
 * docs/PRDs/backend/C-data-repository-dashboard-integration.md's amendment.
 *
 * Session handling is still the mock from mockAuth.ts (localStorage,
 * client-side, insecure) — there is no real auth yet (Module H is
 * future-phase). The client sends its mock session as request headers so
 * these route handlers can apply the same role logic server-side. This
 * header-trust boundary is exactly as insecure as the rest of the mock and
 * must be replaced wholesale once Module H exists — it does NOT need to
 * survive that migration, unlike the tier/access-request logic around it.
 */

export type VisibilityTier = "public" | "on_request" | "internal";
export type Role = "public" | "researcher" | "editor" | "fellow" | "admin";

const STAFF_ROLES: Role[] = ["researcher", "editor", "admin"];
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

/** Reads the tier from Prisma; if no override row exists yet (e.g. a
 * dataset created in CKAN directly, bypassing the seed script), falls back
 * to CKAN's own private flag as "internal" vs "public" — the conservative
 * default until an admin sets a real tier. */
export async function getVisibilityTier(pkg: CkanPackage): Promise<VisibilityTier> {
  const override = await prisma.datasetVisibilityOverride.findUnique({ where: { ckanSlug: pkg.name } });
  if (override) return override.tier;
  return pkg.private ? "internal" : "public";
}

export type AccessState = "full" | "requestable" | "locked";

export async function canAccessDataset(pkg: CkanPackage, session: MockRequestSession): Promise<{ tier: VisibilityTier; state: AccessState }> {
  const tier = await getVisibilityTier(pkg);

  if (tier === "public") return { tier, state: "full" };

  if (!session) return { tier, state: tier === "on_request" ? "requestable" : "locked" };

  if (tier === "on_request") {
    const approved = await prisma.accessRequest.findFirst({
      where: { datasetSlug: pkg.name, requesterEmail: session.email, status: "approved" },
    });
    return { tier, state: approved ? "full" : "requestable" };
  }

  // internal
  return { tier, state: STAFF_ROLES.includes(session.role) ? "full" : "locked" };
}

/** For list/search results: should this package be visible at all to this
 * requester? Mirrors Module C's "internal_only excluded entirely from
 * public search/listing" rule. */
export async function isVisibleInListing(pkg: CkanPackage, session: MockRequestSession): Promise<boolean> {
  const tier = await getVisibilityTier(pkg);
  if (tier !== "internal") return true;
  return !!session && STAFF_ROLES.includes(session.role);
}

export function extraFields(pkg: CkanPackage) {
  return {
    geography: extraValue(pkg, "geography"),
    year: extraValue(pkg, "year"),
    type: extraValue(pkg, "dataset_type"),
    source: extraValue(pkg, "source"),
    coverage: extraValue(pkg, "coverage"),
    frequency: extraValue(pkg, "frequency"),
    lastUpdated: extraValue(pkg, "last_updated"),
  };
}
