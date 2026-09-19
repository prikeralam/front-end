import { NextRequest, NextResponse } from "next/server";
import { datasets as contentDatasets } from "../../../_content/datasets";
import { listDatasets, getDatasetDetail } from "../../../_lib/datasetsService";
import { readMockSession } from "../../../_lib/datasetAccess";
import { prisma } from "../../../_lib/prisma";

// One route for /api/datasets, /api/datasets/[slug] and /api/datasets/[slug]/request-access
// so they share a single Vercel serverless function (Hobby plan caps a
// deployment at 12 functions total). Downloads go straight to the static
// file under /public now (see app/_content/datasets.ts) — no API round trip.

async function handleList(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const session = readMockSession(req);

  const results = await listDatasets({
    q: params.get("q") ?? undefined,
    theme: params.get("theme") ?? undefined,
    geography: params.get("geography") ?? undefined,
    year: params.get("year") ?? undefined,
    type: params.get("type") ?? undefined,
    session,
  });

  return NextResponse.json({ count: results.length, results });
}

async function handleDetail(req: NextRequest, slug: string) {
  const session = readMockSession(req);

  const detail = await getDatasetDetail(slug, session);
  if (!detail) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}

// Only reachable for an "on-request" dataset — none exist in the current
// local content set (app/_content/datasets.ts), so this is unexercised
// until one is added. Kept wired to Prisma's AccessRequest table as before.
async function handleRequestAccess(req: NextRequest, slug: string) {
  const session = readMockSession(req);

  if (!session) {
    return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  }

  const dataset = contentDatasets.find((d) => d.slug === slug);
  if (!dataset) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (dataset.visibility !== "on-request") {
    return NextResponse.json({ error: "not_requestable" }, { status: 400 });
  }

  const existing = await prisma.accessRequest.findFirst({
    where: { datasetSlug: slug, requesterEmail: session.email },
  });
  if (existing) {
    return NextResponse.json({ status: existing.status });
  }

  const created = await prisma.accessRequest.create({
    data: {
      datasetSlug: slug,
      requesterEmail: session.email,
      requesterName: session.name,
      status: "pending",
    },
  });

  return NextResponse.json({ status: created.status }, { status: 201 });
}

// GET /api/datasets?q=&theme=&geography=&year=&type=
// GET /api/datasets/[slug]
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: segments = [] } = await params;

  if (segments.length === 0) return handleList(req);
  if (segments.length === 1) return handleDetail(req, segments[0]);

  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

// POST /api/datasets/[slug]/request-access
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: segments = [] } = await params;

  if (segments.length === 2 && segments[1] === "request-access") {
    return handleRequestAccess(req, segments[0]);
  }

  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
