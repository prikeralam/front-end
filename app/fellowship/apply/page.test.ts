import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
// The form is a client component; only the props the page gives it matter here.
vi.mock("./ApplicationForm", () => ({ default: function ApplicationForm() {
  return null;
} }));

const { default: FellowshipApplyPage } = await import("./page");
const { default: ApplicationForm } = await import("./ApplicationForm");

type Node = { type?: unknown; props?: { children?: unknown } & Record<string, unknown> };

/** The props of the first element of `type` in a rendered tree. */
function propsOf(node: unknown, type: unknown): Record<string, unknown> | null {
  if (Array.isArray(node)) return node.map((child) => propsOf(child, type)).find(Boolean) ?? null;
  if (!node || typeof node !== "object") return null;
  const element = node as Node;
  if (element.type === type) return element.props ?? {};
  return propsOf(element.props?.children, type);
}

describe("/fellowship/apply", () => {
  it("sends an old ?role=<slug> link to that role's own apply page", async () => {
    await expect(FellowshipApplyPage({ searchParams: Promise.resolve({ role: "research-associate" }) })).rejects.toThrow(
      "redirect:/careers/jobs/research-associate/apply",
    );
  });

  it("offers the fellowship and internship form otherwise, with no role", async () => {
    const page = await FellowshipApplyPage({ searchParams: Promise.resolve({}) });
    expect(propsOf(page, ApplicationForm)).toEqual({ email: "contact@priresearch.in" });
  });
});
