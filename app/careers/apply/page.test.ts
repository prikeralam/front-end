import { describe, expect, it, vi } from "vitest";

// The form is a client component; only the props the page gives it matter here.
vi.mock("./ApplicationForm", () => ({ default: function ApplicationForm() {
  return null;
} }));

const { default: CareersApplyPage } = await import("./page");
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

describe("/careers/apply", () => {
  it("offers the fellowship and internship form, with no role", () => {
    expect(propsOf(CareersApplyPage(), ApplicationForm)).toEqual({ email: "contact@priresearch.in" });
  });
});
