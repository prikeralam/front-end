import { getJobDescriptionUrl } from "../../../../_lib/api/engage";

// A stable, shareable address for a role's job description PDF. The stored file's own link is presigned and expires
// (S3), so this asks the backend for a fresh one on every visit and redirects to it.
export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9-]{1,50}$/;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  if (!SLUG.test(slug)) return new Response("Not found", { status: 404 });
  const url = await getJobDescriptionUrl(slug).catch(() => undefined);
  if (url === undefined) return new Response("The job description could not be loaded. Please try again.", { status: 502 });
  if (!url) return new Response("This role has no job description PDF.", { status: 404 });
  return Response.redirect(url, 302);
}
