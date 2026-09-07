# Spec: Contact & Newsletter

**Site section #12** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module G — Forms, Surveys & Contact Management](../backend/G-forms-surveys-contact-management.md)

## Problem Statement

Visitors with a general inquiry, a research question, or a media request currently have no reliable, routed way to reach PRI, and PRI has no way to build a general mailing list of interested visitors or let people revisit past newsletter issues. A single generic inbox (if one exists at all) doesn't distinguish between a journalist on deadline and a general question, causing misrouted or lost inquiries.

## Solution

A contact page with a form that routes inquiries by category (research/media/general), a live map of office locations (if PRI has multiple), and a newsletter sign-up with an archive of past issues.

## User Stories

1. As a visitor, I want to select an inquiry category (research/media/general) when submitting a contact form, so that my message reaches the right team.
2. As a visitor, I want confirmation that my message was sent, so that I know it went through.
3. As a visitor, I want to see PRI's office location(s) on a live map, so that I can find them or gauge where PRI operates from.
4. As a visitor, I want to sign up for PRI's newsletter, so that I receive updates without checking the site.
5. As a visitor, I want to browse an archive of past newsletter issues, so that I can catch up on content I missed before subscribing.
6. As an Admin, I want contact-form submissions routed automatically to the correct department inbox based on category, so that inquiries don't require manual triage.
7. As a journalist, I want a clearly labeled "media" inquiry option, so that my request is recognized as time-sensitive and routed appropriately.
8. As a mobile visitor, I want the contact form and map to work well on a small screen, so that reaching PRI isn't desktop-only.
9. As a visitor using a screen reader, I want the contact form fields and category selector to be properly labeled, so that I can submit an inquiry independently.
10. As an Admin, I want the contact form protected against spam (CAPTCHA/rate-limiting), so that the routed inboxes aren't flooded with junk submissions.
11. As a subscriber, I want to unsubscribe from the newsletter easily, so that I'm not stuck receiving emails I no longer want (standard expectation, not explicit in the source doc but implied by "newsletter sign-up and archive").

## Implementation Decisions

- **Contact form:** one Module G form with a required category field (research/media/general) driving the routing rule — not three separate forms, since the fields are otherwise identical and only the destination differs.
- **Office map:** a "live map" embed (e.g. Google Maps) of one or more office locations; location data (address, coordinates) stored as simple fields, not a full location-management system, since the doc frames this as "if multiple" and doesn't ask for anything beyond display.
- **Newsletter sign-up + archive:** sign-up reuses the same Module G newsletter mechanism as Donors Forum (§9) and Get Involved (§11), tagged "general" segment by default; the archive is a list of past issues, modeled as Module A `Document`/`ContentBlock` entries (issue content) rather than a new content type, since it's fundamentally published, dated content.
- **Spam protection:** CAPTCHA and rate-limiting are explicitly named in the source doc under Module G — this page relies on that being enforced at the form-submission layer, not reimplemented per-page.
- **API contract:** `POST /api/forms/contact/` (Module G, with `category` field driving routing), `GET /api/offices/` (simple location list), `POST /api/newsletter/signup/?segment=general` (Module G), `GET /api/newsletter/archive/` (Module A, published issue list).

## Testing Decisions

Deferred — no code yet. When built, verify that each contact-form category actually routes to its correct, distinct destination (a Module G-level guarantee) — the main way this page could silently fail is a message reaching the wrong inbox.

## Out of Scope

- Live chat or real-time support — not requested in the source doc.
- Newsletter authoring/campaign-sending tooling (e.g. building and sending the actual newsletter email) — the source doc's "Optional Integrations" names Mailchimp/ConvertKit for this; this spec covers sign-up and archive display, not the sending pipeline itself.
- Multiple office locations beyond simple display (e.g. per-office contact routing) — the doc says "if multiple," implying display only, not per-location workflows.

## Further Notes

- Source: docx §12 "Contact & Newsletter" — "Contact form with routing for research/media/general inquiries; Live map of office locations (if multiple); Newsletter sign-up and archive."
- Newsletter mechanism is shared with [Donors & Sponsors Forum](09-donors-sponsors-forum.md) and [Get Involved](11-get-involved.md) — build it once in [Module G](../backend/G-forms-surveys-contact-management.md), segment by audience, don't duplicate.
- This is the smallest/simplest of the future-phase specs and a reasonable candidate for an early "next phase" pick given how much of its infrastructure (Module G forms, Module A document archive) will already exist once Phase 1 + Module G are built.
