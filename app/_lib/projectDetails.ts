/**
 * A project's long write-up (`Project.details` on the backend), in a small Markdown subset: "## " starts a section,
 * "### " a sub-section inside it, "- " a bullet, a blank line ends a paragraph, and **bold** works inline. Text
 * before the first section is the overview. Anything else is kept as plain text: there is no HTML, so nothing an
 * editor types can become markup.
 */

export type DetailBlock = { kind: "paragraph"; text: string } | { kind: "list"; items: string[] };

export type DetailSubsection = { title: string; blocks: DetailBlock[] };

export type DetailSection = { title: string; blocks: DetailBlock[]; subsections: DetailSubsection[] };

export type ProjectDetails = { overview: DetailBlock[]; sections: DetailSection[] };

export function parseProjectDetails(text: string): ProjectDetails {
  const overview: DetailBlock[] = [];
  const sections: DetailSection[] = [];
  // Where the next paragraph or list goes: the overview, a section's opening text, or its latest sub-section.
  let target = overview;
  let paragraph: string[] = [];
  let list: string[] | null = null;

  const flush = () => {
    if (paragraph.length) target.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
    list = null;
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      flush();
      const title = heading[2].trim();
      if (heading[1] === "##" || sections.length === 0) {
        // A "###" before any "##" opens a section of its own rather than being lost.
        sections.push({ title, blocks: [], subsections: [] });
        target = sections[sections.length - 1].blocks;
      } else {
        const section = sections[sections.length - 1];
        section.subsections.push({ title, blocks: [] });
        target = section.subsections[section.subsections.length - 1].blocks;
      }
    } else if (/^[-*]\s+/.test(line)) {
      if (paragraph.length) flush();
      if (!list) {
        list = [];
        target.push({ kind: "list", items: list });
      }
      list.push(line.replace(/^[-*]\s+/, ""));
    } else if (!line) {
      flush();
    } else if (list && /^\s+/.test(raw)) {
      // An indented line continues the bullet above it.
      list[list.length - 1] += ` ${line}`;
    } else {
      list = null;
      paragraph.push(line);
    }
  }
  flush();
  return { overview, sections };
}

/** Splits **bold** runs out of a line; an unclosed "**" stays as typed. */
export function splitBold(text: string): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts;
}
