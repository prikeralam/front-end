# Data stories: writing and uploading the story file

A data story on `/research/<slug>` has two parts:

| Part | Where it comes from |
|---|---|
| Site header and footer, the format and theme tag, **title**, **abstract** (shown under the title), author, date, cover | The publication's fields in the dashboard (**Research & Publications**) |
| Everything in between: key figures, text, interactive charts, data table, sources and notes | **The story file**: one HTML file uploaded in the same form |

The site shows the story file in a sandboxed frame. The file's scripts run, but they can't reach the site, the
reader's session or the page around them. The frame grows to the story's full height, so readers scroll the page as
usual. Footnote links (`href="#..."`) scroll the page, and any other link opens in a new tab.

Examples that follow these rules are in [`data-stories/examples/`](data-stories/examples/). Start new stories from
[`data-story-template.html`](data-story-template.html).

## Rules for the story file

1. **One self-contained `.html` file, up to 5 MB, saved as UTF-8.** Put the data inside the file. Don't load data from
   other sites.
2. **Body only.** Leave out the title, kicker or tag, summary paragraph, byline and date. The page already shows them,
   taken from the dashboard, so they would appear twice. Put the summary in the publication's **Abstract**, because it
   also feeds the research list, search results and link previews. Start the file with the key figures or the first
   paragraph. Use `<h2>` and `<h3>` for sections, never `<h1>`.
3. **Scripts are inline, or loaded from `https://cdnjs.cloudflare.com/` or `https://cdn.jsdelivr.net/npm/` with an exact
   version** (for example `d3/7.9.0`, `plotly.js-basic-dist-min@2.35.2`). The upload is refused if a script loads from
   anywhere else.
4. **Scope every style under one root id** (for example `#pri-hs`) and keep the background white or transparent.
5. **Use the PRI look:**
   - Accent: PRI blue `#253D9A`. Emphasis: coral `#E4633F`. Text: `#171a2b`, softer text `#4b4f66`, muted
     `#8b8fa3`. Rules: `#e6e8f0`.
   - Fonts: **Public Sans** for all text, including headings, and **IBM Plex Mono** for big figures and small uppercase
     labels. Both come from Google Fonts (see the template). The site's own heading font can't be loaded inside the
     frame.
6. **Works on a 320px-wide phone, and without hover.** Tapping a chart shows its values. Keep a "View the full data"
   table so every figure can be read without the charts, and add a `<noscript>` line.
7. **Don't size anything in `vh` units.** The frame is as tall as the story, so a `100vh` element keeps growing.
8. **Leave out analytics, cookies, `localStorage`, `alert()` and links that target the top window.** The sandbox
   blocks them anyway.
9. **Write the story's words in the HTML, not from a script.** The page also shows the story as plain text ("Read this
   story as text"), which is what search engines index and what readers see if the charts can't run. It is built from
   the file's headings, paragraphs, list items and captions. Text that a script draws, or that sits inside an SVG chart,
   a button, a label or a table, is left out, so put every sentence that matters in a `<p>`.

## Publishing

1. In the dashboard, go to **Research & Publications → + New**. Choose **Format: Data story**, then fill in the title,
   abstract, sub-theme, date, author and cover. A draft can be saved without a cover, but it can't be published
   without one, because the cover is the image on the story's card in the research list.
2. Under **Story file (HTML)**, choose the file and save. The new publication is saved as a draft.
3. Open the draft again. **Story file → Preview story** shows the file exactly as the public page will frame it. Fix
   any warning shown there, such as a duplicate main heading.
4. Submit the draft for review. An editor publishes it.

To change the story, upload a new file in the same field. To go back to showing only the abstract, use **Remove story
file**.

## For the author's Claude Code project

Paste this into the `CLAUDE.md` of the project where stories are written:

```markdown
## PRI data story files
Each story is ONE self-contained HTML file uploaded to the PRI website, which shows it in a sandboxed iframe under
the site's own title, abstract, byline and date.
- Body only: no <h1>, kicker or tag, summary paragraph, byline or date. Start with the key figures or the first
  paragraph. Sections use <h2>/<h3>.
- All CSS scoped under one root id; white or transparent background; no `vh` units.
- Scripts inline, or from https://cdnjs.cloudflare.com/ or https://cdn.jsdelivr.net/npm/ with an exact pinned version.
  Data inline; no fetch to other sites.
- Fonts: Public Sans (all text), IBM Plex Mono (big figures, small uppercase labels), from Google Fonts.
- Colours: PRI blue #253D9A (accent), coral #E4633F (emphasis), text #171a2b / #4b4f66, muted #8b8fa3, rules #e6e8f0.
- Must work at 320px wide and by tap (no hover-only info). Keep a "View the full data" table and a <noscript> line.
- No analytics, cookies, localStorage, alert(), or links targeting the top window.
- Under 5 MB, UTF-8.
- Write all prose in the HTML (<h2>, <h3>, <p>, <li>, <figcaption>), never generated by script: the site builds the
  story's plain-text version (for search engines) from those elements only.
```

## How it works (for developers)

- Backend: `Publication.story_html` (website-backend `apps/publications`). The validators enforce the extension, size,
  UTF-8 and script hosts. The file is stored as `stories/<random>.txt`, so opening its raw URL shows the source as text
  instead of running it.
- Frontend: `_lib/api/stories.ts` fetches the text on the server (cached on public pages like other API reads, and refreshed as soon as an editor saves in the dashboard; uncached for
  the dashboard preview). `research/_ui/StoryFrame.tsx` renders it with `srcdoc` and
  `sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"`. **Never add `allow-same-origin`**: that would
  let the story run as this site. `_lib/storyFrame.ts` adds a base style and a small bridge script that reports the
  height and anchor offsets. The page accepts only well-formed numbers, and only from its own frame.
- Search engines read the page's title, abstract and structured data, and the story's text: `_lib/storyText.ts`
  extracts the headings, paragraphs, list items and captions from the file on the server (dropping scripts, styles,
  SVG, controls and their labels, tables, footnote markers, and few-word scraps such as chart legends), and
  `research/_ui/StoryText.tsx` renders them under the frame in a closed `<details>`, "Read this story as text". It is
  real page content that readers can open, not hidden text, and it is shown only when there are at least 80 words.
  The text inside the frame itself counts for less, so the abstract should still state the key findings.
