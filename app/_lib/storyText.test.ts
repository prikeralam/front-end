import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MAX_STORY_TEXT_CHARS, extractStoryText, storyWordCount } from "./storyText";

const example = (name: string) => readFileSync(`docs/data-stories/examples/${name}.html`, "utf8");

describe("extractStoryText", () => {
  it("keeps headings, paragraphs and list items in order, as text", () => {
    const blocks = extractStoryText(`
      <h1>Title</h1>
      <p>First <strong>bold</strong> and <a href="#n1">linked</a> words.</p>
      <h3>Detail</h3>
      <ul><li>One item</li><li>Two <em>items</em></li></ul>
      <figure><div id="chart"></div><figcaption>A caption.</figcaption></figure>`);
    expect(blocks).toEqual([
      { kind: "heading", text: "Title" },
      { kind: "paragraph", text: "First bold and linked words." },
      { kind: "subheading", text: "Detail" },
      { kind: "item", text: "One item" },
      { kind: "item", text: "Two items" },
      { kind: "paragraph", text: "A caption." },
    ]);
  });

  it("leaves out scripts, styles, charts, controls, tables, comments and the head", () => {
    const blocks = extractStoryText(`<!doctype html><html><head><title>Tab</title><style>p{color:red}</style></head><body>
      <script>document.write("drawn by script")</script>
      <!-- a note to self -->
      <svg><text>Axis label</text></svg>
      <button>Show all districts</button>
      <table><tr><td>Malappuram</td><td>64</td></tr></table>
      <noscript>Enable JavaScript</noscript>
      <p>Only this.</p></body></html>`);
    expect(blocks).toEqual([{ kind: "paragraph", text: "Only this." }]);
  });

  it("keeps adjacent words apart, without spaces before punctuation", () => {
    const blocks = extractStoryText(`<div class="stat"><b>36,303</b><span>people per centre</span></div><p>(<em>see</em> <a href="#">this</a>), <b>Kerala</b>'s <b>64</b>%. He said 'so'.</p>`);
    expect(blocks).toEqual([
      { kind: "paragraph", text: "36,303 people per centre" },
      { kind: "paragraph", text: "(see this), Kerala's 64%. He said 'so'." },
    ]);
  });

  it("leaves out footnote markers and the labels of a chart's controls", () => {
    const blocks = extractStoryText('<p>Claim directly.<sup><a href="#n1">1</a></sup> Next.</p><label><input type="checkbox"> Highlight Malabar</label>');
    expect(blocks).toEqual([{ kind: "paragraph", text: "Claim directly. Next." }]);
  });

  it("drops legend and toggle scraps but keeps short headings, items and sentences", () => {
    const blocks = extractStoryText("<h2>Introduction</h2><span>Malabar</span><div>Rest of Kerala</div><p>It fell.</p><ul><li>Kozhikode</li></ul>");
    expect(blocks).toEqual([
      { kind: "heading", text: "Introduction" },
      { kind: "paragraph", text: "It fell." },
      { kind: "item", text: "Kozhikode" },
    ]);
  });

  it("decodes entities and skips lines with no letters", () => {
    const blocks = extractStoryText("<p>Kerala&rsquo;s &amp; India&#8217;s &#x20B9;5&nbsp;crore</p><p>64</p><p>&mdash;</p>");
    expect(blocks).toEqual([{ kind: "paragraph", text: "Kerala’s & India’s ₹5 crore" }]);
  });

  it("caps the text kept", () => {
    const paragraph = `<p>${"word ".repeat(2000)}</p>`;
    const total = extractStoryText(paragraph.repeat(30)).reduce((sum, b) => sum + b.text.length, 0);
    expect(total).toBeLessThanOrEqual(MAX_STORY_TEXT_CHARS);
    expect(total).toBeGreaterThan(MAX_STORY_TEXT_CHARS - 10_001);
  });

  it("reads the example stories' prose, not their chart code", () => {
    const blocks = extractStoryText(example("malappuram-classrooms"));
    expect(blocks.filter((b) => b.kind === "heading").map((b) => b.text)).toContain("The most crowded classrooms in the state");
    expect(storyWordCount(blocks)).toBeGreaterThan(300);
    const text = blocks.map((b) => b.text).join(" ");
    expect(text).not.toMatch(/function|Plotly|=>|\{|\}/);

    const health = extractStoryText(example("kerala-health-malabar"));
    expect(health.some((b) => b.kind === "subheading" && b.text === "Malabar is not uniform")).toBe(true);
    expect(health.map((b) => b.text).join(" ")).not.toMatch(/d3\.|\.attr\(/);
  });
});
