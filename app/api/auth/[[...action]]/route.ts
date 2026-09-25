import { handleLogin, handleLogout, handleSession } from "../../../_lib/auth/handlers";

// One catch-all route rather than three: Vercel's Hobby plan caps the number of serverless functions per deployment.

type Context = { params: Promise<{ action?: string[] }> };

const notFound = () => Response.json({ detail: "Not found." }, { status: 404 });

export async function GET(_request: Request, { params }: Context) {
  const { action } = await params;
  return action?.length === 1 && action[0] === "session" ? handleSession() : notFound();
}

export async function POST(request: Request, { params }: Context) {
  const { action } = await params;
  if (action?.length !== 1) return notFound();
  if (action[0] === "login") return handleLogin(request);
  if (action[0] === "logout") return handleLogout(request);
  return notFound();
}
