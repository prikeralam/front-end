# Spec: Data Repository & Library

**Site section #4** · Status: Drafted · Depends on: [Backend Module C — Data Repository & Dashboard Integration](../backend/C-data-repository-dashboard-integration.md)

## Problem Statement

PRI produces datasets and data visualizations (e.g. school coverage maps, hate-speech heatmaps) that are currently unusable to the public: there is no searchable interface to find them, no way to preview a dataset before downloading, no metadata telling a researcher whether a dataset is current or how it was collected, and no mechanism to gate sensitive datasets behind a request/approval step. This blocks exactly the audience — researchers, journalists, policy analysts — the underlying data work is meant to serve.

## Solution

A public-facing, searchable and filterable data repository page that lists curated datasets and visualization dashboards, lets visitors preview data (table view, map view) before downloading, shows metadata (source, coverage, update frequency) for every dataset, and supports three visibility tiers (public, on-request, internal-only) — with account-gated access for restricted datasets.

## User Stories

1. As a researcher, I want to search and filter datasets by theme, geography, year, or type, so that I can find relevant data without scrolling through everything.
2. As a visitor, I want to preview a dataset in a table view before downloading it, so that I can judge relevance without committing to a download.
3. As a visitor, I want to preview geographic datasets (e.g. school coverage, hate-speech incidents) on an interactive map, so that I can understand spatial patterns at a glance.
4. As a visitor, I want to see metadata for each dataset (source, geographic/temporal coverage, update frequency), so that I can judge how current and trustworthy the data is before using it.
5. As a visitor, I want to view embedded visualization dashboards (built with tools like Datawrapper/Tableau Public/D3.js), so that I can explore PRI's data findings without needing to build my own charts.
6. As a visitor encountering a restricted dataset, I want to see that it exists and understand it requires a request or account, so that I'm not simply blocked with no explanation and know how to proceed.
7. As a registered user with approved access, I want to download an "on request" dataset I've been granted access to, so that I can use it in my own work.
8. As a Researcher (content role), I want a dataset I upload through the backend to default to a visibility tier I choose (public / on request / internal-only), so that sensitive data isn't accidentally exposed.
9. As a visitor, I want dataset search results to load with a visible loading state and a clear empty state ("no datasets match your filters"), so that I'm never staring at an ambiguous blank page.
10. As a mobile visitor, I want the dataset table/map previews to remain usable on a small screen (even if simplified), so that I'm not completely blocked from the data repository on mobile.
11. As a visitor using a screen reader, I want dataset metadata and search/filter controls to be properly labeled, so that I can search and understand results without relying on visual layout alone.

## Implementation Decisions

- **Page structure:** Search/filter bar (theme, geography, year, type) at top → results grid/list of dataset cards (title, short description, visibility badge, metadata summary) → dataset detail view (full metadata, table/map preview toggle, download or request-access action) → separate area or tab for embedded visualization dashboards distinct from raw datasets.
- **Visibility tiers surfaced in the UI:** `public` (preview + direct download), `on request` (preview allowed, download requires an authenticated request/approval flow), `internal-only` (not listed publicly at all, or listed with no preview/download — decide which at build time based on whether "discoverable but gated" or "fully hidden" is wanted; source doc implies datasets can be made internal-only, not that they're hidden from the index, so default assumption is "visible, clearly gated," but flagged as needing confirmation).
- **Preview modes:** table view (paginated, for tabular formats like CSV/XLSX) and map view (for geo-tagged datasets, e.g. GeoJSON) — both are read endpoints from Module C, not client-side file parsing, since datasets may be large.
- **Dashboards vs. datasets:** treated as two related but distinct listings on this page — a "dashboard" is an embedded third-party visualization (Datawrapper/Tableau/D3 embed) tied to one or more datasets; a "dataset" is a downloadable/previewable file with metadata. Both share the same theme/geography/year/type filtering.
- **Account gating for restricted datasets:** this page assumes user accounts and a request/approval mechanism exist (per source doc's "Option for user accounts... for restricted datasets or request-based downloads") — the account/auth system itself and the request-approval workflow are owned by Module C's spec, not re-defined here; this page only consumes the resulting access-state per dataset (locked/unlocked/pending).
- **API contract with Module C:** needs (a) a searchable/filterable dataset list endpoint, (b) a dataset detail endpoint including metadata and visibility state, (c) table-preview and map-preview data endpoints, (d) a dashboards list/detail endpoint, (e) a request-access endpoint for on-request datasets. Exact shapes finalized in Module C's own spec.

## Testing Decisions

Deferred — no code or test infrastructure exists yet. When implementation begins, prioritize testing the visibility-tier gating logic as external behavior (a public dataset is downloadable by anyone; an on-request dataset is not downloadable until access is granted; an internal-only dataset is never downloadable by a Donor/Visitor role) since that's the highest-consequence correctness requirement on this page. Follow whichever testing pattern is established by the first-built module.

## Out of Scope

- Building the third-party visualization tools themselves (Datawrapper/Tableau Public/D3.js) — this page embeds/links to dashboards built with those tools, it doesn't reimplement charting.
- Full account/auth system design (registration, login, request-approval workflow mechanics) — assumed to exist as a dependency, detailed in Module C's spec, not this one.
- Dataset licensing/DOI generation (mentioned in the source doc's long-term scalability plan, e.g. via Zenodo/CrossRef) — future phase, not Phase 1.
- Research & Publications Hub (§3) — a related but separate section (written publications vs. structured datasets); not built here even though both will eventually share search UI patterns.

## Further Notes

- Source: docx §4 "Data Repository & Library" — "Public-facing searchable interface for: Curated datasets; Visualization dashboards; Interactive maps (e.g. school coverage, hate speech heatmap); Metadata view (source, coverage, update frequency); Option for user accounts (for restricted datasets or request-based downloads)."
- The visibility-tier default behavior (public-index-but-gated vs. fully-hidden for internal-only) should be confirmed with PRI stakeholders before Module C's data model is finalized, since it's a real product decision, not just an implementation detail.
