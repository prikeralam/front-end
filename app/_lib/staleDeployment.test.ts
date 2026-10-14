import { describe, expect, it } from "vitest";
import { isStaleDeploymentResponse } from "./staleDeployment";

describe("isStaleDeploymentResponse", () => {
  it("spots Next's unknown-Server-Action answer and nothing else", () => {
    expect(isStaleDeploymentResponse(new Response(null, { status: 404, headers: { "x-nextjs-action-not-found": "1" } }))).toBe(true);
    expect(isStaleDeploymentResponse(new Response(null, { status: 404 }))).toBe(false);
    expect(isStaleDeploymentResponse(new Response("ok"))).toBe(false);
  });
});
