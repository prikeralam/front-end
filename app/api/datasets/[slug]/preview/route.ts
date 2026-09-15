import { NextRequest, NextResponse } from "next/server";
import { getDatasetPreview } from "../../../../_lib/datasetsService";
import { readMockSession } from "../../../../_lib/datasetAccess";

// GET /api/datasets/[slug]/preview — real sample rows, fetched and parsed
// from each CSV resource's CKAN-hosted file (not CKAN's datastore, which
// isn't populated in this stack — see pri-ckan README).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = readMockSession(req);

  const resources = await getDatasetPreview(slug, session);
  if (resources === null) {
    return NextResponse.json({ error: "not_found_or_forbidden" }, { status: 404 });
  }

  return NextResponse.json({ resources });
}
