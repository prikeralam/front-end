import { NextRequest, NextResponse } from "next/server";
import { listDatasets } from "../../_lib/datasetsService";
import { readMockSession } from "../../_lib/datasetAccess";

// GET /api/datasets?q=&theme=&geography=&year=&type=
export async function GET(req: NextRequest) {
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
