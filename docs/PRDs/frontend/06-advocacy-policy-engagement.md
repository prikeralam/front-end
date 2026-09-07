# Spec: Advocacy & Policy Engagement

**Site section #6** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module A — CMS](../backend/A-content-management-system.md)

## Problem Statement

PRI's advocacy work — legislative memos, policy briefs, white papers, data-driven questions raised with policymakers, scorecards, and formal letters to ministries/media/courts — currently has no public record. Without a visible archive, PRI can't demonstrate policy influence to funders, journalists can't easily reference PRI's advocacy positions, and there's no way to show the throughline from PRI's data/research to concrete policy engagement.

## Solution

A section presenting legislative memos, policy briefs, and white papers; political-engagement tools such as data-driven questions and representation/inclusion scorecards; a repository of letters submitted to ministries, media outlets, and courts; and event snapshots from policy roundtables or stakeholder meetings — all as CMS-managed, dated, and categorized content.

## User Stories

1. As a policymaker or journalist, I want to browse legislative memos, policy briefs, and white papers, so that I can understand PRI's positions on specific issues.
2. As a visitor, I want to see "questions raised using PRI's data" as a distinct content type, so that I can trace how PRI's research translated into direct political engagement.
3. As a visitor, I want to view scorecards on representation/inclusion, so that I can see PRI's data-driven assessment of institutions or policies presented in a structured, comparable format.
4. As a researcher, I want to browse a repository of letters PRI has submitted to ministries, media outlets, or courts, so that I have a documented record of PRI's formal advocacy actions.
5. As a visitor, I want to see event snapshots (photos, summaries) from policy roundtables or stakeholder meetings, so that I understand PRI's engagement beyond published documents.
6. As a visitor, I want to filter advocacy content by type (memo, brief, white paper, letter, scorecard, event snapshot) and by date, so that I can find relevant material efficiently.
7. As a Researcher, I want to upload and draft new advocacy content (memos, briefs, letters) through the same CMS workflow as other content, so that publishing this material doesn't require a separate system.
8. As an Editor, I want advocacy content to require approval before publishing, so that formally-worded policy positions and letters go out only with sign-off.
9. As a visitor, I want to download advocacy documents (memos, briefs, letters) as PDFs, so that I can cite or forward them.
10. As a visitor using a screen reader, I want scorecards to be presented with accessible table markup (not only as images), so that the data is usable non-visually.
11. As a mobile visitor, I want advocacy content (especially scorecards) to remain legible on a small screen, so that I'm not forced onto desktop to review it.

## Implementation Decisions

- **Content types, all as Module A `Document`/`ContentBlock`-style entries with a shared "advocacy" category tag rather than five separate models:** memo/brief/white paper (document + web view), question/scorecard (structured content — scorecards specifically may need a lightweight structured-data field, e.g. named entities + scores, rather than pure prose, flagged as a modeling detail for Module A extension), letter (document, with recipient/date metadata), event snapshot (photos + summary text, distinct from the full Events & Campaigns module §10/Module G, which handles registration — this is a lightweight recap, not a calendar entry).
- **Filtering:** by type and date range, consistent with the filter pattern used in the Publications Hub (§3) and Data Repository (§4) — reuse that UI pattern rather than inventing a new one.
- **Workflow:** reuses Module A's Draft→Review→Approve→Publish state machine; no new workflow needed.
- **API contract:** `GET /api/advocacy/?type=&from=&to=` (list/filter), `GET /api/advocacy/{slug}/` (detail + PDF link) — modeled as an extension of Module A's existing `Document`/`ContentBlock` endpoints with an `advocacy` category, not a new module.

## Testing Decisions

Deferred — no code yet. Since this section is built entirely on Module A's existing content types, testing follows Module A's established pattern; the one section-specific risk worth flagging for later is scorecard data accuracy/rendering, which should get its own check once the structured-data field shape is decided.

## Out of Scope

- Interactive/dynamic scorecard visualizations (e.g. sortable comparison tools) — the source doc implies presenting scorecards, not building an interactive analysis tool; static structured presentation only, unless later requested.
- Formal event registration/calendar functionality — that's Events & Campaigns (§10)/Module G; this section only shows retrospective snapshots.
- Legal/compliance review workflow for letters beyond the standard Editor approval — not specified in the source doc.

## Further Notes

- Source: docx §6 "Advocacy & Policy Engagement" — "Legislative memos, policy briefs, white papers; Political engagement tools: Questions raised using PRI's data; Scorecards on representation/inclusion; Repository of letters submitted to ministries, media outlets, and courts; Event snapshots from policy roundtables or stakeholder meetings."
- Deliberately modeled as an extension of [Module A](../backend/A-content-management-system.md) rather than a new backend module, since the source doc doesn't list a dedicated backend module for advocacy content (the 8 backend modules A–H don't include one) — confirm this assumption with stakeholders when this section is prioritized, in case a dedicated module is actually wanted.
