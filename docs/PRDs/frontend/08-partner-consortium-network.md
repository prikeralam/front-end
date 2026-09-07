# Spec: Partner & Consortium Network

**Site section #8** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module A — CMS](../backend/A-content-management-system.md), [Backend Module G — Forms, Surveys & Contact Management](../backend/G-forms-surveys-contact-management.md)

## Problem Statement

PRI collaborates with institutional partners (universities, NGOs, research orgs) and a Collaborative Consortium of civil-society/movement leaders, but there's no public page establishing who those partners are or how a new organization or individual could join. This weakens credibility (partnerships are a trust signal for funders and other institutions) and leaves no self-service path for interested parties to initiate a partnership.

## Solution

A page displaying logos and brief profiles of institutional partners, a listing of Collaborative Consortium members, and forms for becoming a partner, collaborating on research, or co-hosting an event.

## User Stories

1. As a visitor, I want to see logos and brief descriptions of PRI's institutional partners, so that I can assess PRI's network and credibility at a glance.
2. As a visitor, I want to see who is part of the Collaborative Consortium (civil society, movement leaders), so that I understand PRI's broader coalition beyond formal institutions.
3. As an organization interested in partnering, I want to fill out a "become a partner" form, so that I can initiate a relationship without needing a personal introduction.
4. As a researcher at another institution, I want to fill out a "collaborate on research" form, so that I can propose joint work.
5. As an event organizer, I want to fill out a "co-host an event" form, so that I can propose a joint event without an existing contact at PRI.
6. As a visitor, I want partner logos to link through to a brief profile or the partner's own site, so that I can learn more about a specific partner.
7. As a Comms/Admin staff member, I want to add, edit, or remove partner and consortium-member entries through the CMS, so that the network listing stays current without developer involvement.
8. As an Admin, I want form submissions (partnership, collaboration, co-hosting) routed to the correct internal team/inbox, so that inquiries don't get lost.
9. As a visitor submitting a partnership form, I want confirmation that my submission was received, so that I know it went through.
10. As a mobile visitor, I want the partner logo grid to reflow sensibly on a small screen, so that browsing partners isn't broken on mobile.
11. As a visitor using a screen reader, I want partner logos to have descriptive alt text (organization name), so that the partner list is meaningful non-visually.

## Implementation Decisions

- **Partner/consortium-member listing:** a `Partner` content type in Module A (name, logo image, brief description, type: institutional/consortium, optional link) — distinct from `PersonProfile` since partners are typically organizations, not individuals (consortium "movement leaders" who are individuals can still use `PersonProfile` if that's a better fit; decide case-by-case at build time, default to `Partner` for organizations).
- **Forms:** three distinct forms (become a partner / collaborate on research / co-host an event) built through Module G's form system rather than three bespoke frontend forms with custom backend handling — keeps routing, CAPTCHA, and rate-limiting consistent with every other form on the site.
- **Routing:** each form submission routes to a specific internal recipient/department via Module G's email-routing mechanism (e.g. partnerships form → partnerships lead, research-collaboration form → research team).
- **API contract:** `GET /api/partners/?type=` (listing, Module A), `POST /api/forms/partnership/`, `POST /api/forms/research-collaboration/`, `POST /api/forms/co-host-event/` (Module G, one endpoint per form type or one generic `POST /api/forms/{form_slug}/` — exact shape is Module G's decision).

## Testing Decisions

Deferred — no code yet. Once built, verify each of the three forms submits successfully, receives confirmation, and reaches the correct routing destination (a Module G-level concern) rather than testing anything unique to this page beyond the partner listing rendering correctly from CMS data.

## Out of Scope

- A partner portal / login area for partners to manage their own listing — not requested in the source doc; listing is CMS-managed by PRI staff only.
- CRM sync of form submissions (mentioned generally under Module G's Zoho/Airtable integration) — this page just submits into Module G's forms; the CRM sync itself is Module G's concern.
- Detailed partner case studies/success stories — the doc specifies "logos and brief info," not full case-study pages; revisit if stakeholders want more depth later.

## Further Notes

- Source: docx §8 "Partner & Consortium Network" — "Logos and brief info of institutional partners (universities, NGOs, research orgs); Members of the Collaborative Consortium (civil society, movement leaders); Forms for becoming a partner, collaborating on research, or co-hosting events."
- The individual-vs-organization modeling question (`PersonProfile` vs. a new `Partner` type) should be revisited once this section and [Donors & Sponsors Forum](09-donors-sponsors-forum.md) (which also lists named supporters) are both being built, since they may share the same "supporter/affiliate" content shape.
