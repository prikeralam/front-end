# Spec: Homepage

**Site section #1** · Status: Drafted · Depends on: [Backend Module A — CMS](../backend/A-content-management-system.md)

## Problem Statement

A first-time visitor, a returning donor, a journalist, or a prospective fellow all land on PRI's homepage with different questions: "What does this organization do and why does it matter?", "What has PRI published or said recently?", "How do I get to the thing I actually came for (data, publications, applying, donating)?". Today there is no website at all, so none of these visitors can answer those questions online — PRI has no discoverable, credible front door, and no way to route different audiences to the right part of the site quickly.

## Solution

A single homepage that, within one scroll or two, communicates PRI's mission, surfaces the most recent research/media/event activity, and routes each type of visitor to the relevant hub (Data Repository, Publications, Get Involved) — plus social proof via testimonials from collaborators, fellows, and donors. All homepage content (mission copy, "latest updates" feed, testimonials) is editorially managed through the CMS (Module A) rather than hardcoded, so comms staff can update it without a developer.

## User Stories

1. As a first-time visitor, I want to see PRI's mission and vision stated clearly above the fold, so that I immediately understand what the organization does.
2. As a first-time visitor, I want to see a short, current list of PRI's latest research, media mentions, and events, so that I can judge whether PRI is active and credible.
3. As a returning visitor, I want quick links to the major site areas (Data Hub, Publications, Get Involved), so that I don't have to hunt through navigation to reach what I usually come for.
4. As a journalist or researcher, I want to see recent publications/updates without navigating away from the homepage, so that I can quickly scan for anything relevant to a story or citation.
5. As a prospective donor, I want to see testimonials from existing collaborators, fellows, or donors on the homepage, so that I can gauge PRI's credibility and impact before exploring further.
6. As a prospective fellow or intern, I want a visible path from the homepage into "Get Involved" / fellowship information, so that I know PRI accepts applicants without digging.
7. As a comms staff member (Editor role), I want to update the mission statement, the "latest updates" feed, and testimonials through the CMS, so that the homepage stays current without a developer making code changes.
8. As a mobile visitor, I want the homepage to be fully usable on a small screen, so that I'm not blocked from reaching the rest of the site on the device I actually have.
9. As a visitor using assistive technology, I want the homepage to be screen-reader compatible with meaningful heading structure and alt text, so that I can navigate it independently.
10. As a visitor, I want the homepage to load quickly even before the "latest updates" content has finished fetching, so that I'm not staring at a blank page.
11. As a Malayalam-speaking visitor, I want a language toggle available on the homepage, so that I can read the site's core messaging in my preferred language (per source doc's "Optional Integrations": English + Malayalam toggle).

## Implementation Decisions

- **Sections, top to bottom:** Hero (mission/vision statement) → Latest Updates feed (research/media/events, most recent first, capped count e.g. 3–6 items) → Quick Links (Data Hub, Publications, Get Involved as prominent cards/CTAs, not buried in nav) → Testimonials (collaborators/fellows/donors, rotating or grid).
- **Content source:** Hero copy, testimonials, and quick-link labels are CMS-managed content blocks (Module A) with an Editor/Comms role able to edit them; "Latest Updates" is a CMS query (most recent published items across content types — research, media, events) rather than a manually curated list, so it stays current without manual homepage edits.
- **Testimonials as a distinct content type** in the CMS (author name, role/affiliation, quote, optional photo) rather than freeform text blocks, so they can be reused (e.g. also shown on Donors & Sponsors Forum, out of scope for now but worth the modeling now).
- **Quick Links target routes:** Data Hub → Data Repository & Library (§4, in scope this phase); Publications → Research & Publications Hub (§3, future phase — link can point to a "coming soon" or be omitted until §3 exists); Get Involved → §11 (future phase, same caveat).
- **API contract with Module A:** Homepage needs read endpoints for (a) site-wide content blocks by slug (hero, quick-link labels), (b) a "latest updates" list endpoint filterable/orderable by publish date across content types, (c) a testimonials list endpoint. These are to be finalized in Module A's own spec, not duplicated here.
- **Language toggle (EN/Malayalam):** homepage carries the toggle control; actual i18n content strategy (per-field translation vs. separate localized content entries) is an open question to resolve when Module A's content model is built — noted here as a dependency, not decided in this spec.

## Testing Decisions

Deferred — no code or test infrastructure exists yet for this project. When implementation begins, revisit this section to define: what "correct" homepage rendering means as an external-behavior test (e.g. hero text renders from CMS data, quick links point to the right routes, latest-updates list reflects CMS state), which layer owns those tests (Next.js page/component tests vs. an integration test against Module A's API), and any prior art once a first module has established the project's testing pattern.

## Out of Scope

- Full Research & Publications Hub (§3) and its content — only linked to, not built, in this phase.
- Fellowship/Internship Portal (§5), Advocacy (§6), Media Watch (§7), Partner Network (§8), Donors Forum (§9), Events (§10), Get Involved (§11), Contact (§12) — homepage may link toward these but their pages are future phases.
- Personalization (different homepage content per logged-in role) — not requested in the source doc for the homepage.
- Search functionality — belongs to the Data Repository / Publications hubs, not the homepage.

## Further Notes

- Source: docx §1 "Homepage" — "Mission and vision statement; Latest updates (research, media, events); Quick links to major areas (Data Hub, Publications, Get Involved); Testimonials from collaborators, fellows, and donors."
- This is the first spec written for the project; Module A's spec (next) should treat the content types implied here (hero/content blocks, latest-updates queryable feed, testimonials) as required content types, not optional ones.
