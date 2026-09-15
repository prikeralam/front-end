import { NextRequest, NextResponse } from "next/server";
import { getDataset, CkanError } from "../../../../_lib/ckan";
import { readMockSession, isVisibleInListing, getVisibilityTier } from "../../../../_lib/datasetAccess";
import { prisma } from "../../../../_lib/prisma";

// POST /api/datasets/[slug]/request-access — creates a pending AccessRequest
// for the caller (identified via the mock session headers). Only valid for
// on_request-tier datasets.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
