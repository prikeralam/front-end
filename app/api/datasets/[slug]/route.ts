import { NextRequest, NextResponse } from "next/server";
import { getDatasetDetail } from "../../../_lib/datasetsService";
import { readMockSession } from "../../../_lib/datasetAccess";

// GET /api/datasets/[slug] — detail + metadata + this requester's access state.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = readMockSession(req);

  const detail = await getDatasetDetail(slug, session);
  if (!detail) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
