// Liveness check for the container, nginx and deploy smoke tests. It does not call the backend, so a backend
// outage does not roll back a frontend deploy.
export const dynamic = "force-dynamic";

export function GET() {
  return new Response("ok", { headers: { "Cache-Control": "no-store" } });
}
