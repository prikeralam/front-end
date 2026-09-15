import { NextRequest, NextResponse } from "next/server";
import { getDataset, CkanError } from "../../../../_lib/ckan";
import { readMockSession, isVisibleInListing, canAccessDataset } from "../../../../_lib/datasetAccess";

// GET /api/datasets/[slug]/download?resource=<ckan resource id>
// The only route that ever hands back a real file. Re-checks visibility +
// access-request approval server-side on every call — never trust a
// previously-rendered "full" state from the client.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
