# Spec: Media Watch & Rapid Response Section

**Site section #7** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module E — Media Watch & Rapid Response Module](../backend/E-media-watch-rapid-response-module.md)

## Problem Statement

Misinformation, hate speech, and biased coverage circulate faster than any manual response process can track, and without a structured public record, PRI has no way to demonstrate its rapid-response role or let the public find its rebuttals, op-eds, and explainers tied to specific media incidents. There's also no searchable archive, so past cases (and PRI's responses to them) are effectively lost after the news cycle passes.

## Solution

A section presenting a daily/weekly digest of flagged misinformation, hate speech, or biased coverage; PRI's official responses (rebuttals, op-eds, explainers); downloadable press statements, video explainers, and social-media toolkit assets; and an archived, tagged case system searchable by theme, source, and date.

## User Stories

1. As a visitor, I want to see a digest of recently flagged media items (misinformation, hate speech, biased coverage), so that I understand what PRI is currently tracking.
2. As a journalist, I want to read PRI's official response (rebuttal, op-ed, explainer) tied to a specific flagged item, so that I can reference PRI's position in my own reporting.
3. As a visitor, I want to watch short video explainers related to a media case, so that I can understand the issue quickly without reading a long document.
4. As a comms professional at a partner org, I want to download a social-media toolkit for a given case, so that I can help amplify PRI's response.
5. As a researcher, I want to search the archive by theme, source, or date, so that I can find PRI's response to a specific past incident.
6. As a visitor, I want each case tagged consistently (theme, source, date, classification type), so that browsing and filtering are reliable.
7. As an internal reviewer (Editor role), I want flagged items to go through an internal review step before any public response is published, so that PRI's rapid responses are still accurate and vetted, not purely reactive.
8. As a Researcher, I want to submit a newly flagged media item with supporting evidence (image/headline/video), so that it enters the internal review queue.
9. As an Admin, I want to see a trends dashboard (by source, keyword, date) internally, so that I can identify patterns worth a coordinated response — this is an internal tool, but its existence should inform what data this public section can eventually surface (e.g. "most-flagged sources this month").
10. As a mobile visitor, I want the digest and case archive to be usable on a small screen, so that I can follow rapid-response content on the go, which is how this kind of content is often consumed.
11. As a visitor using a screen reader, I want case entries and their classification tags to be announced clearly, so that the archive is navigable non-visually.

## Implementation Decisions

- **Public-facing scope vs. internal scope:** this frontend spec covers only the public-facing digest, response archive, and downloadable toolkits — the internal flagging/review queue and trends dashboard (Module E's core) are internal tools, exposed here only as the source of published, approved cases.
- **Content types (Module E-backed):** `MediaCase` (flagged item: headline/image/video reference, classification tag, source, date, status) → linked `Response` (PRI's rebuttal/op-ed/explainer, video, press statement, toolkit assets) — a case can exist with items pending review that never surface publicly until a `Response` is published and the case is marked public.
- **Digest generation:** the "daily/weekly digest" is a filtered, time-windowed query over published cases (most recent first), not a separately maintained content type — same pattern as the Homepage's "Latest Updates" feed (Module A), applied here to Module E's data instead.
- **Toolkit downloads:** treated as file attachments on a `Response` (press statement, video file/link, toolkit zip/assets), reusing the same file-storage approach as documents elsewhere (S3/DO Spaces).
- **API contract:** `GET /api/media-cases/?theme=&source=&from=&to=` (archive search/filter), `GET /api/media-cases/{id}/` (detail incl. linked response and downloadable assets), `GET /api/media-cases/digest/?window=daily|weekly` (digest feed).

## Testing Decisions

Deferred — no code yet. When built, the highest-value test is that a `MediaCase` never appears in any public endpoint until it has a published `Response` and is explicitly marked public — mirrors the visibility-gating discipline established in [Module C](../backend/C-data-repository-dashboard-integration.md)'s spec, and should follow the same testing priority (correctness of what's hidden vs. shown, before anything else).

## Out of Scope

- The internal flagging/review workflow UI and trends dashboard — owned by [Module E](../backend/E-media-watch-rapid-response-module.md), not this public page.
- Automated misinformation detection (e.g. ML classification of media items) — the source doc describes manual flagging and classification, not automated detection.
- Real-time/live-updating digest (e.g. websocket push) — a periodically-refreshed feed is sufficient per the doc's "daily/weekly digest" framing.

## Further Notes

- Source: docx §7 "Media Watch & Rapid Response Section" — "Daily/weekly digest of flagged misinformation, hate speech, or biased coverage; PRI's official responses (rebuttals, op-eds, explainers); Short video explainers, press statements, social media toolkit downloads; Archive and tagging system for media cases by theme/source/date."
- The digest-feed pattern here intentionally mirrors the Homepage's "Latest Updates" endpoint (see [Module A](../backend/A-content-management-system.md) spec) — worth generalizing into one shared "recent published items" mechanism across modules when more than one such feed exists.
