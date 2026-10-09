/**
 * Uploaded data stories (one self-contained HTML file each) run in a sandboxed iframe with no same-origin access, so
 * their scripts never run as this site. The frame cannot size itself or scroll the page, so a small script injected
 * here reports the story's height and asks the page to scroll to in-story anchors (footnotes); the page accepts only
 * messages from its own frame, with numbers in range.
 */

export const STORY_MESSAGE = "pri-story";
/** Taller than any real story; a story whose height keeps growing (e.g. sized in `vh`) stops here. */
export const MAX_STORY_HEIGHT = 60000;

/** The iframe's sandbox: scripts and new-tab links only. Never add `allow-same-origin` (the story would run as this site). */
export const STORY_SANDBOX = "allow-scripts allow-popups allow-popups-to-escape-sandbox";

const BASE_STYLE = "<style>html,body{margin:0;background:transparent}</style>";

// Runs inside the story. Plain ES5 so it works whatever the story's own scripts expect.
const BRIDGE = `<script>(function(){
  var last = -1;
  function post(kind, value){ parent.postMessage({ type: "${STORY_MESSAGE}", kind: kind, value: value }, "*"); }
  function report(){
    var h = Math.ceil(document.documentElement.getBoundingClientRect().height);
    if (h !== last) { last = h; post("height", h); }
  }
  window.addEventListener("load", report);
  if (window.ResizeObserver) new ResizeObserver(report).observe(document.documentElement);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(report);
  // Browsers can pause rendering callbacks (ResizeObserver) in a frame, e.g. in a hidden window; a cheap timer
  // check catches late reflows anyway, and only posts when the height actually changed.
  setInterval(report, 1000);
  report();
  // The page may start listening after the first report (the frame loads before hydration), so it can ask again.
  window.addEventListener("message", function(ev){
    if (ev.source === parent && ev.data && ev.data.type === "${STORY_MESSAGE}" && ev.data.kind === "measure") { last = -1; report(); }
  });
  document.addEventListener("click", function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a || ev.defaultPrevented) return;
    var href = a.getAttribute("href");
    if (href.charAt(0) === "#") {
      var target = href.length > 1 && document.getElementById(href.slice(1));
      if (target) { ev.preventDefault(); post("scroll", Math.max(0, Math.round(target.getBoundingClientRect().top))); }
      return;
    }
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  }, true);
})();</script>`;

/**
 * The story with the base style and the bridge first: the style so the story's own CSS wins, the bridge so it runs
 * before the story's scripts (a slow CDN script would otherwise hold the frame at its placeholder height).
 */
export function wrapStoryHtml(html: string): string {
  const prelude = BASE_STYLE + BRIDGE;
  const head = /<head\b[^>]*>/i.exec(html);
  if (head) return html.slice(0, head.index + head[0].length) + prelude + html.slice(head.index + head[0].length);
  const doctype = /^\s*<!doctype[^>]*>/i.exec(html);
  if (doctype) return doctype[0] + prelude + html.slice(doctype[0].length);
  return `<!doctype html>${prelude}${html}`;
}

/** What the page sends the frame to ask for its height again. */
export const MEASURE_REQUEST = { type: STORY_MESSAGE, kind: "measure" } as const;

export type StoryMessage = { kind: "height" | "scroll"; value: number };

/** A message from the story frame, or null for anything else (other frames, extensions, malformed or absurd values). */
export function parseStoryMessage(data: unknown): StoryMessage | null {
  if (!data || typeof data !== "object") return null;
  const { type, kind, value } = data as Record<string, unknown>;
  if (type !== STORY_MESSAGE || (kind !== "height" && kind !== "scroll")) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  if (kind === "height" && (value < 1 || value > MAX_STORY_HEIGHT)) return null;
  return { kind, value: Math.round(value) };
}

/** Things worth flagging before publishing a story file. They don't block the upload. */
export function storyWarnings(html: string): string[] {
  const warnings: string[] = [];
  if (/<h1\b/i.test(html)) warnings.push("The file has its own main heading (<h1>). The page already shows the title, so it will appear twice.");
  if (/\b\d+(\.\d+)?(dvh|svh|lvh|vh)\b/i.test(html)) warnings.push("The file sizes something in vh units. The story frame is as tall as the story, so those sizes can grow without end.");
  return warnings;
}
