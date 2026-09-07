# Spec: Research & Publications Hub

**Site section #3** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module B — Publication Repository](../backend/B-publication-repository-module.md), [Backend Module A — CMS](../backend/A-content-management-system.md) (author profiles)

## Problem Statement

PRI's core output — research reports, working papers, briefs, explainers, and visual formats like infographics and data stories — has no public home. Researchers, journalists, funders, and policymakers who want to find PRI's work on a given theme (Education, Economy, Governance, Health, Media) currently have no way to search, filter, or browse it, and no consistent way to cite or credit the fellows, mentors, and staff who produced it. This makes PRI's actual research output effectively invisible relative to the effort spent producing it.

## Solution

A searchable, filterable publications library organized by thematic category and format (report, working paper, brief, explainer, infographic, video, data story), each entry linked to author profiles, downloadable as a PDF and viewable as a shareable web page, backed by the Publication Repository module (Module B).

## User Stories

1. As a researcher, I want to filter publications by thematic category (Education, Economy, Governance, Health, Media, etc.), so that I can find work relevant to my area without reading everything.
2. As a visitor, I want to filter by format (report, working paper, brief, explainer, infographic, video, data story), so that I can choose content matching how much time/attention I have.
3. As a visitor, I want to search publications by keyword, so that I can find a specific piece without knowing its exact title.
4. As a journalist, I want to view a publication as a shareable web page (not only a PDF), so that I can link to it directly in an article.
5. As a researcher, I want to download a publication as a PDF, so that I can read or cite it offline.
6. As a visitor, I want to click through from a publication to its author's profile, so that I can see the fellow/mentor/staff member's other work and credentials.
7. As a visitor viewing an author profile, I want to see all publications by that author, so that I can browse someone's body of work in one place.
8. As a Researcher (content role), I want to upload a new publication with metadata (title, authors, abstract, date, tags), so that it becomes discoverable in the hub once approved.
9. As an Editor, I want new publications to go through the same Draft→Review→Approve→Publish workflow as other content, so that nothing goes live without editorial sign-off.
10. As a visitor, I want to see visual-format content (infographics, videos, data stories) rendered inline rather than only as downloadable files, so that I can engage with it without leaving the page.
11. As a visitor using a screen reader, I want publication metadata and filter controls to be properly labeled, so that I can search and browse independently.
12. As a mobile visitor, I want the publications grid and filters to remain usable on a small screen, so that browsing isn't desktop-only.

## Implementation Decisions

- **Page structure:** Filter/search bar (theme, format, date range, author) → results grid (title, authors, format badge, date, thumbnail) → publication detail page (abstract, full web view for shareable formats, PDF download link, author profile links, citation export).
- **Data model consumed from Module B:** `Publication` (title, authors[], abstract, date, tags[], format, DOI/slug, file, visibility) — this page is a read-only consumer of Module B's repository; it does not duplicate publication storage.
- **Author profiles:** reuses Module A's `PersonProfile` model (the same one used for governance members in About PRI), filtered/grouped as "fellows, mentors, staff" rather than "governance" — this is the concrete case the About PRI spec anticipated when it made `PersonProfile.group` a tag field instead of hardcoding it to governance.
- **Thematic categories:** implemented as a controlled tag vocabulary (Education, Economy, Governance, Health, Media, + extensible) shared between this page's filters and Module B's tagging fields, not freeform text, so filtering stays reliable.
- **API contract with Module B:** `GET /api/publications/?theme=&format=&q=&author=` (search/filter/list), `GET /api/publications/{slug}/` (detail, web view content), `GET /api/publications/{slug}/download/` (PDF), plus `GET /api/people/{id}/publications/` (reusing Module A's person endpoints) for the author-profile cross-link.

## Testing Decisions

Deferred — no code yet. When built, prioritize testing filter/search correctness (theme × format × text query combinations return the right set) and the visibility gate (unpublished/draft publications never appear in public list/detail responses), following whichever test pattern Module A/B establish first.

## Out of Scope

- Citation export (BibTeX/RIS/APA) — this is a Module B backend feature; this spec only covers the frontend hub consuming it, not designing the export formats.
- Full-text search inside PDF contents — metadata/tag search only, per the doc's framing ("searchable and filterable library" via metadata, not stated as full-document indexing).
- Comment/discussion features on publications — not mentioned in the source doc.

## Further Notes

- Source: docx §3 "Research & Publications Hub" — "Searchable and filterable library of: Research reports, working papers, briefs, explainers; Visual formats: infographics, videos, data stories; Thematic categories: Education, Economy, Governance, Health, Media, etc.; Author profiles (fellows, mentors, staff); Downloadable PDFs + shareable web views."
- Shares the `PersonProfile` model decision made in [Module A](../backend/A-content-management-system.md) and [About PRI](02-about-pri.md) — author profiles here and governance profiles there are the same underlying content type, distinguished by `group`.
- This section and Data Repository & Library (§4, Phase 1) are natural siblings (both are searchable content libraries with theme-based filtering) — worth sharing UI components between them when both are eventually built.
