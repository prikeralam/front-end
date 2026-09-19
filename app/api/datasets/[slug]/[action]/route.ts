import { NextRequest, NextResponse } from "next/server";
import { getDataset, CkanError } from "../../../../_lib/ckan";
import { getDatasetPreview } from "../../../../_lib/datasetsService";
import { readMockSession, isVisibleInListing, canAccessDataset, getVisibilityTier } from "../../../../_lib/datasetAccess";
import { prisma } from "../../../../_lib/prisma";

// Combines the former /download, /preview and /request-access routes into one
// dynamic [action] segment so they share a single Vercel serverless function
// instead of three (Hobby plan caps deployments at 12 functions total).

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

// GET /api/datasets/[slug]/download?resource=<ckan resource id>
// GET /api/datasets/[slug]/preview
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; action: string }> }) {
  const { slug, action } = await params;

  if (action === "download") return handleDownload(req, slug);
  if (action === "preview") return handlePreview(req, slug);

  return NextResponse.json({ error: "not_found" }, { status: 404 });
}

// POST /api/datasets/[slug]/request-access
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string; action: string }> }) {
  const { slug, action } = await params;

  if (action === "request-access") return handleRequestAccess(req, slug);

  return NextResponse.json({ error: "not_found" }, { status: 404 });
}
