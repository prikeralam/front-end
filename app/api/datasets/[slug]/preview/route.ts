import { NextRequest, NextResponse } from "next/server";
import { getDataset, CkanError } from "../../../../_lib/ckan";
import { readMockSession, isVisibleInListing, canAccessDataset } from "../../../../_lib/datasetAccess";

// GET /api/datasets/[slug]/preview — paginated table preview.
//
// NOTE: real paginated preview requires CKAN's datastore (populated via
// datapusher/xloader), which pri-ckan's docker-compose stack doesn't run
// yet (see pri-ckan README) — adding it is future scope, not faked here.
// Until then this returns resource metadata only (name/format/size), which
// is enough for the UI to show "N resources available" without pretending
// to paginate rows it doesn't have.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
  if (state === "locked") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    datastoreAvailable: false,
    resources: pkg.resources.map((r) => ({ id: r.id, name: r.name, format: r.format })),
  });
}
