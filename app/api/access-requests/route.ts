import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../_lib/prisma";
import { readMockSession, canReviewAccessRequests } from "../../_lib/datasetAccess";

// GET /api/access-requests            — reviewer-only: full pending queue.
// GET /api/access-requests?mine=1     — the caller's own requests.
export async function GET(req: NextRequest) {
  const session = readMockSession(req);
  const mine = req.nextUrl.searchParams.get("mine");

  if (mine) {
    if (!session) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
    const requests = await prisma.accessRequest.findMany({ where: { requesterEmail: session.email }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ results: requests });
  }

  if (!canReviewAccessRequests(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const requests = await prisma.accessRequest.findMany({ where: { status: "pending" }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ results: requests });
}

// PATCH /api/access-requests — { datasetSlug, requesterEmail, decision: "approved" | "denied" }
export async function PATCH(req: NextRequest) {
  const session = readMockSession(req);
  if (!canReviewAccessRequests(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { datasetSlug, requesterEmail, decision } = body as { datasetSlug?: string; requesterEmail?: string; decision?: string };

  if (!datasetSlug || !requesterEmail || (decision !== "approved" && decision !== "denied")) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const existing = await prisma.accessRequest.findFirst({ where: { datasetSlug, requesterEmail, status: "pending" } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await prisma.accessRequest.update({
    where: { id: existing.id },
    data: { status: decision, reviewedAt: new Date(), reviewerEmail: session.email },
  });

  return NextResponse.json({ status: updated.status });
}
