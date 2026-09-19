import { NextRequest, NextResponse } from "next/server";
import { listDatasets, getDatasetDetail, getDatasetPreview } from "../../../_lib/datasetsService";
import { getDataset, CkanError } from "../../../_lib/ckan";
import { readMockSession, isVisibleInListing, canAccessDataset, getVisibilityTier } from "../../../_lib/datasetAccess";
import { prisma } from "../../../_lib/prisma";

// Collapses /api/datasets, /api/datasets/[slug] and the former /download,
// /preview, /request-access sub-routes into one optional catch-all so they
// share a single Vercel serverless function instead of five (Hobby plan
// caps a deployment at 12 functions total). URLs are unchanged.

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

async function handleDownload(req: NextRequest, slug: string) {
  const resourceId = req.nextUrl.searchParams.get("resource");
  const session = readMockSession(req);

  let pkg;
  try {
    pkg = await getDataset(slug);
  } catch (err) {
    if (err instanceof CkanError && err.status === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    throw err;
  }

  if (!(await isVisibleInListing(pkg, session))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { state } = await canAccessDataset(pkg, session);
  if (state !== "full") {
    return NextResponse.json({ error: state === "requestable" ? "access_required" : "forbidden" }, { status: 403 });
  }

  const resource = resourceId ? pkg.resources.find((r) => r.id === resourceId) : pkg.resources[0];
  if (!resource) {
    return NextResponse.json({ error: "no_resource" }, { status: 404 });
  }

  return NextResponse.redirect(resource.url);
}

async function handlePreview(req: NextRequest, slug: string) {
  const session = readMockSession(req);

  const resources = await getDatasetPreview(slug, session);
  if (resources === null) {
    return NextResponse.json({ error: "not_found_or_forbidden" }, { status: 404 });
  }

  return NextResponse.json({ resources });
}

async function handleRequestAccess(req: NextRequest, slug: string) {
  const session = readMockSession(req);

  if (!session) {
    return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  }

  let pkg;
  try {
    pkg = await getDataset(slug);
  } catch (err) {
    if (err instanceof CkanError && err.status === 404) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    throw err;
  }

  if (!(await isVisibleInListing(pkg, session))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const tier = await getVisibilityTier(pkg);
  if (tier !== "on_request") {
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
// GET /api/datasets/[slug]/download?resource=<ckan resource id>
// GET /api/datasets/[slug]/preview
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug: segments = [] } = await params;

  if (segments.length === 0) return handleList(req);
  if (segments.length === 1) return handleDetail(req, segments[0]);
  if (segments.length === 2 && segments[1] === "download") return handleDownload(req, segments[0]);
  if (segments.length === 2 && segments[1] === "preview") return handlePreview(req, segments[0]);

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
