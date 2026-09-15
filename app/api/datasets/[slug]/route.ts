import { NextRequest, NextResponse } from "next/server";
import { getDataset, extraValue, CkanError } from "../../../_lib/ckan";
import { readMockSession, isVisibleInListing, canAccessDataset, extraFields } from "../../../_lib/datasetAccess";

// GET /api/datasets/[slug] — detail + metadata + this requester's access state.
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
    // internal_only, non-staff requester — behave as if it doesn't exist.
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { tier, state } = await canAccessDataset(pkg, session);
  const fields = extraFields(pkg);

  return NextResponse.json({
    slug: pkg.name,
    title: pkg.title,
    description: pkg.notes,
    visibility: tier,
    accessState: state,
    theme: pkg.groups[0]?.title ?? null,
    ...fields,
    fileFormat: extraValue(pkg, "fileFormat") ?? pkg.resources[0]?.format ?? null,
    tags: pkg.tags.map((t) => t.name),
    files:
      state === "full"
        ? pkg.resources.map((r) => ({ label: r.name, path: `/api/datasets/${slug}/download?resource=${r.id}` }))
        : [],
  });
}
