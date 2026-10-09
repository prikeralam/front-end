import { describe, expect, it } from "vitest";
import { MAX_STORY_HEIGHT, STORY_MESSAGE, STORY_SANDBOX, parseStoryMessage, storyWarnings, wrapStoryHtml } from "./storyFrame";

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;
const BRIDGE_MARK = "new ResizeObserver(report)";

describe("wrapStoryHtml", () => {
  it("turns a fragment into a standards-mode document with the base style and bridge before the story", () => {
    const story = '<style>#s{color:red}</style><article id="s">Hi</article><script src="https://cdn.example/x.js"></script>';
    const out = wrapStoryHtml(story);
    expect(out.startsWith("<!doctype html><style>html,body{margin:0")).toBe(true);
    expect(out.indexOf("html,body{margin:0")).toBeLessThan(out.indexOf("#s{color:red}"));
    // The bridge runs before the story's own scripts, which may be slow to load.
    expect(out.indexOf(BRIDGE_MARK)).toBeLessThan(out.indexOf("https://cdn.example/x.js"));
    expect(out.endsWith(story)).toBe(true);
    expect(count(out, BRIDGE_MARK)).toBe(1);
  });

  it("puts the base style and bridge inside an existing head", () => {
    const out = wrapStoryHtml("<!DOCTYPE html><html><head><title>x</title></head><body><p>Hi</p></body></html>");
    expect(out).toMatch(/^<!DOCTYPE html><html><head><style>html,body\{margin:0/);
    expect(out.indexOf(BRIDGE_MARK)).toBeLessThan(out.indexOf("<title>"));
    expect(out.endsWith("<body><p>Hi</p></body></html>")).toBe(true);
    expect(count(out, "<!doctype")).toBe(0);
  });

  it("keeps a doctype first when there is no head", () => {
    const out = wrapStoryHtml("<!doctype html>\n<p>Hi</p>");
    expect(out.startsWith("<!doctype html><style>")).toBe(true);
    expect(count(out.toLowerCase(), "<!doctype")).toBe(1);
  });

  it("injects exactly one bridge script", () => {
    expect(count(wrapStoryHtml("<p>a</p><script>var x = 1;</script>"), BRIDGE_MARK)).toBe(1);
  });
});

describe("parseStoryMessage", () => {
  const msg = (kind: unknown, value: unknown) => ({ type: STORY_MESSAGE, kind, value });

  it("accepts heights and scroll offsets in range", () => {
    expect(parseStoryMessage(msg("height", 1234.4))).toEqual({ kind: "height", value: 1234 });
    expect(parseStoryMessage(msg("scroll", 0))).toEqual({ kind: "scroll", value: 0 });
  });

  it("rejects other messages, kinds and non-finite, negative or absurd values", () => {
    expect(parseStoryMessage(null)).toBeNull();
    expect(parseStoryMessage("pri-story")).toBeNull();
    expect(parseStoryMessage({ type: "other", kind: "height", value: 10 })).toBeNull();
    expect(parseStoryMessage(msg("navigate", 10))).toBeNull();
    expect(parseStoryMessage(msg("height", "500"))).toBeNull();
    expect(parseStoryMessage(msg("height", Number.NaN))).toBeNull();
    expect(parseStoryMessage(msg("height", Infinity))).toBeNull();
    expect(parseStoryMessage(msg("height", -5))).toBeNull();
    expect(parseStoryMessage(msg("height", 0))).toBeNull();
    expect(parseStoryMessage(msg("height", MAX_STORY_HEIGHT + 1))).toBeNull();
  });
});

describe("storyWarnings", () => {
  it("flags a duplicate main heading and vh sizing", () => {
    expect(storyWarnings("<h1>Title</h1><div style='height:100vh'></div>")).toHaveLength(2);
    expect(storyWarnings("<H1 class='x'>Title</H1>")).toHaveLength(1);
  });

  it("is quiet for a body-only story", () => {
    expect(storyWarnings("<h2>Intro</h2><p>Text with 12px margins.</p>")).toEqual([]);
  });
});

it("never grants same-origin access to the story", () => {
  expect(STORY_SANDBOX).not.toContain("allow-same-origin");
  expect(STORY_SANDBOX).not.toContain("allow-top-navigation");
});
