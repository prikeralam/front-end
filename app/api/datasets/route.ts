import { NextRequest, NextResponse } from "next/server";
import { searchDatasets, extraValue } from "../../_lib/ckan";
import { readMockSession, isVisibleInListing, getVisibilityTier, extraFields } from "../../_lib/datasetAccess";

// GET /api/datasets?q=&theme=&geography=&year=&type=
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const session = readMockSession(req);

  const { results } = await searchDatasets({
    q: params.get("q") ?? undefined,
    theme: params.get("theme") ?? undefined,
    rows: 200,
  });

  const geography = params.get("geography");
  const year = params.get("year");
  const type = params.get("type");

  const visible = [];
  for (const pkg of results) {
    if (!(await isVisibleInListing(pkg, session))) continue;

    const fields = extraFields(pkg);
    if (geography && fields.geography !== geography) continue;
    if (year && fields.year !== year) continue;
    if (type && fields.type !== type) continue;

    const tier = await getVisibilityTier(pkg);
    visible.push({
      slug: pkg.name,
      title: pkg.title,
      description: pkg.notes,
      visibility: tier,
      theme: pkg.groups[0]?.title ?? null,
      ...fields,
      fileFormat: extraValue(pkg, "fileFormat") ?? pkg.resources[0]?.format ?? null,
    });
  }

  return NextResponse.json({ count: visible.length, results: visible });
}
