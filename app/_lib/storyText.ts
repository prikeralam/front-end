/**
 * The readable text of an uploaded data story: its headings, paragraphs, list items and captions, in order.
 *
 * The story itself runs in a sandboxed iframe, whose text search engines may not credit to the page, so the page also
 * shows this as a plain-text version. Only text written in the HTML is found: text that scripts draw, or that sits
 * inside an SVG chart, is not (docs/data-stories.md tells authors so). Dependency-free on purpose: story files are
 * the author's own trusted uploads, and the output is rendered as React text, never as HTML.
 */

export type StoryTextBlock = { kind: "heading" | "subheading" | "paragraph" | "item"; text: string };

// Whole elements whose text isn't prose: code, styling, drawings, controls and their labels, data tables, footnote
// markers (superscript links) and the document head.
const DROPPED = ["head", "script", "style", "noscript", "template", "svg", "math", "canvas", "iframe", "object", "button", "select", "textarea", "label", "nav", "table", "sup"];
const BLOCK_TAGS = "p|div|section|article|main|header|footer|aside|figure|figcaption|blockquote|ul|ol|dl|dt|dd|br|hr|caption|pre|details|summary|form|fieldset";
// Private-use markers that can't occur in decoded text, so a line can carry its block kind until it is split.
const MARK = "\uE000";
const KINDS: Record<string, StoryTextBlock["kind"]> = { h1: "heading", h2: "heading", h3: "subheading", h4: "subheading", h5: "subheading", h6: "subheading", li: "item" };

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "\u2014", hellip: "…", lsquo: "‘", rsquo: "’",
  ldquo: "“", rdquo: "”", minus: "−", times: "×", deg: "°", middot: "·", bull: "•", rarr: "→", larr: "←", copy: "©", rupee: "₹",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Caps the text kept, so a very long story can't make the page itself enormous. */
export const MAX_STORY_TEXT_CHARS = 100_000;

export function extractStoryText(html: string): StoryTextBlock[] {
  let s = html.replace(/<!--[\s\S]*?-->/g, " ");
  for (const tag of DROPPED) s = s.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"), " ");
  s = s
    .replace(/<(h[1-6]|li)\b[^>]*>/gi, (_m, tag: string) => `\n${MARK}${tag.toLowerCase()}${MARK}`)
    .replace(/<\/(h[1-6]|li)\s*>/gi, "\n")
    .replace(new RegExp(`<\\/?(${BLOCK_TAGS})\\b[^>]*>`, "gi"), "\n")
    // Other tags become a space, since adjacent elements (a figure and its label) are often separate words; the
    // space that leaves before punctuation, as in "<a>linked</a>.", is taken out again below.
    .replace(/<[^>]*>/g, " ");

  const blocks: StoryTextBlock[] = [];
  let total = 0;
  for (const raw of s.split("\n")) {
    const tagged = raw.match(new RegExp(`^\\s*${MARK}(h[1-6]|li)${MARK}([\\s\\S]*)$`));
    const text = decodeEntities(tagged ? tagged[2] : raw)
      .replace(/\s+/g, " ")
      .replace(/ ([.,;:!?)\]%’”]|['’]s\b)/g, "$1")
      .replace(/([(\[‘“]) /g, "$1")
      .trim();
    // A lone number or symbol is a chart label or a stray mark, not something to read.
    if (!/\p{L}/u.test(text)) continue;
    const kind = tagged ? KINDS[tagged[1]] : "paragraph";
    // So is a scrap of a few words that isn't a sentence: a chart legend ("Rest of Kerala") or a toggle's text.
    if (kind === "paragraph" && text.split(" ").length < 4 && !/[.!?:]$/.test(text)) continue;
    if (total + text.length > MAX_STORY_TEXT_CHARS) break;
    total += text.length;
    blocks.push({ kind, text });
  }
  return blocks;
}

/** Words in the extracted text; the page shows the text version only when there's enough to be worth reading. */
export function storyWordCount(blocks: StoryTextBlock[]): number {
  return blocks.reduce((sum, block) => sum + block.text.split(" ").length, 0);
}
