import { describe, expect, it } from "vitest";
import { parseProjectDetails, splitBold } from "./projectDetails";

describe("parseProjectDetails", () => {
  it("keeps text before the first section as the overview", () => {
    const parsed = parseProjectDetails("First paragraph\nwraps here.\n\nSecond paragraph.\n\n## Section\n\nBody.");
    expect(parsed.overview).toEqual([
      { kind: "paragraph", text: "First paragraph wraps here." },
      { kind: "paragraph", text: "Second paragraph." },
    ]);
    expect(parsed.sections).toEqual([{ title: "Section", blocks: [{ kind: "paragraph", text: "Body." }], subsections: [] }]);
  });

  it("puts sub-sections inside the section above them, after its opening text", () => {
    const parsed = parseProjectDetails("## One\nIntro.\n### A\n- x\n- y\n### B\nText.\n## Two\n- z");
    expect(parsed.sections).toEqual([
      {
        title: "One",
        blocks: [{ kind: "paragraph", text: "Intro." }],
        subsections: [
          { title: "A", blocks: [{ kind: "list", items: ["x", "y"] }] },
          { title: "B", blocks: [{ kind: "paragraph", text: "Text." }] },
        ],
      },
      { title: "Two", blocks: [{ kind: "list", items: ["z"] }], subsections: [] },
    ]);
  });

  it("separates a paragraph from a list that follows without a blank line", () => {
    const parsed = parseProjectDetails("Sources include:\n- Census\n* SRS\nAfter the list.");
    expect(parsed.overview).toEqual([
      { kind: "paragraph", text: "Sources include:" },
      { kind: "list", items: ["Census", "SRS"] },
      { kind: "paragraph", text: "After the list." },
    ]);
  });

  it("joins an indented line onto the bullet above", () => {
    expect(parseProjectDetails("- long bullet\n  continues").overview).toEqual([{ kind: "list", items: ["long bullet continues"] }]);
  });

  it("opens a section for a sub-heading that comes before any section", () => {
    expect(parseProjectDetails("### Early\nText.").sections[0].title).toBe("Early");
  });

  it("handles Windows line endings and an empty write-up", () => {
    expect(parseProjectDetails("## A\r\nB").sections[0].blocks).toEqual([{ kind: "paragraph", text: "B" }]);
    expect(parseProjectDetails("")).toEqual({ overview: [], sections: [] });
  });

  it("treats a single # as text, not a heading", () => {
    expect(parseProjectDetails("# Not a heading").overview).toEqual([{ kind: "paragraph", text: "# Not a heading" }]);
  });
});

describe("splitBold", () => {
  it("splits bold runs from plain text", () => {
    expect(splitBold("**Label:** text and **more**")).toEqual([
      { text: "Label:", bold: true },
      { text: " text and ", bold: false },
      { text: "more", bold: true },
    ]);
  });

  it("leaves an unclosed marker as typed", () => {
    expect(splitBold("a ** b")).toEqual([{ text: "a ** b", bold: false }]);
  });
});
