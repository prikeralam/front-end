# Spec: Donors & Sponsors Forum

**Site section #9** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module F — Donor & Fundraising Backend](../backend/F-donor-fundraising-backend.md), [Backend Module A — CMS](../backend/A-content-management-system.md) (reports, named-program content)

## Problem Statement

Donors and prospective sponsors have no way to see the impact of their support, verify PRI's financial transparency, or actually give money through the website — donations and funder communication currently must happen entirely offline or through disconnected channels, and there's no public demonstration of "here's what your support achieved," which weakens fundraising credibility and conversion.

## Solution

A page showing impact metrics from donor support, annual funder reports and financial-transparency materials, named-program showcases (e.g. "XYZ Research Fellowship supported by..."), an integrated donation call-to-action with payment processing, and a newsletter sign-up specifically for donors and impact updates.

## User Stories

1. As a prospective donor, I want to see impact metrics showing what donor support has achieved, so that I can judge whether my contribution would be well used.
2. As a prospective donor, I want to view annual funder reports and financial-transparency materials, so that I can do due diligence before giving.
3. As a visitor, I want to see named programs (e.g. "XYZ Research Fellowship supported by...") crediting specific funders, so that I understand how sponsorship is structured and recognized.
4. As a donor, I want to make a donation directly on the site through an integrated payment option, so that I don't have to go through a separate offline process.
5. As a donor, I want a receipt/confirmation after donating, so that I have proof of the transaction (and, per Module F, a tax receipt where applicable).
6. As a prospective sponsor, I want a clear call-to-action for partnership/sponsorship (distinct from a one-time donation), so that I can pursue a larger or ongoing funding relationship.
7. As a donor, I want to sign up for a donor-specific newsletter with impact updates, so that I stay informed about outcomes without needing to check the site.
8. As a returning donor, I want to log in and access my own donation history/reports (per Module F's donor dashboard), so that I have a self-service record of my giving.
9. As an Admin, I want to set and update donation tiers and monitor active campaigns, so that fundraising messaging on this page reflects current priorities.
10. As a mobile donor, I want the donation flow (form + payment) to work smoothly on a mobile browser, so that I'm not blocked from giving on the device I have.
11. As a visitor using a screen reader, I want impact metrics and the donation form to be properly labeled, so that I can understand and give independently.
12. As an Admin, I want financial-transparency documents to reuse the same legal/registration fields already modeled on the About PRI page, so that donor-facing compliance information stays consistent site-wide.

## Implementation Decisions

- **Sections, top to bottom:** Impact metrics (aggregate stats, sourced from Module F) → Named programs showcase (CMS content linking a program name to its funder credit line) → Financial transparency (annual funder reports, reusing Module A's `Document` type, plus the legal/registration fields already modeled in [About PRI](02-about-pri.md)) → Donation CTA (amount selection → payment gateway redirect/embed) → Donor newsletter sign-up (Module G) → (for authenticated donors) link to donor dashboard.
- **Payment processing:** per the source doc, Razorpay/Instamojo integration lives in Module F, not on the frontend directly — this page only initiates the flow and displays confirmation/receipt state returned by Module F.
- **Named programs:** a lightweight `NamedProgram` content type (program name, funder credit line, optional linked report) in Module A, distinct from `Partner` (§8) since this is about funding credit on a specific program, not a general partnership listing.
- **Newsletter sign-up:** uses the same newsletter mechanism as Contact & Newsletter (§12)/Module G, tagged as "donor" segment for targeted impact-update sends, rather than a separate newsletter system.
- **API contract:** `GET /api/impact-metrics/` (Module F, aggregate stats), `GET /api/named-programs/` (Module A), `GET /api/documents/?type=annual_funder_report` (Module A, reusing the Document type from About PRI), `POST /api/donations/` (Module F, initiates payment flow), `POST /api/newsletter/signup/?segment=donor` (Module G).

## Testing Decisions

Deferred — no code yet. The donation flow (amount → payment gateway → confirmation/receipt) is the highest-risk path on this page given it involves real money; when built, prioritize testing that a failed/cancelled payment never shows a false success state, and that receipts are only generated for confirmed successful transactions (a Module F-level guarantee this page must correctly reflect).

## Out of Scope

- Payment gateway integration itself (Razorpay/Instamojo account setup, webhook handling) — owned by [Module F](../backend/F-donor-fundraising-backend.md).
- Recurring/subscription donations — not specified in the source doc; revisit if PRI wants ongoing giving, not just one-time.
- CRM sync of donor records (Zoho/Airtable, per source doc's general integrations list) — a Module F backend concern, not this page's.

## Further Notes

- Source: docx §9 "Donors & Sponsors Forum" — "Impact metrics (what donor support has achieved); Annual funder reports and financial transparency tools; Named programs (e.g. 'XYZ Research Fellowship supported by...'); Call-to-action for donations and partnerships (with integrated payment options); Newsletter sign-up for donors and impact updates."
- Reuses the legal-status/registration fields modeled in [About PRI](02-about-pri.md) for financial transparency — do not re-model these from scratch when this page is built.
- Newsletter sign-up shares infrastructure with [Contact & Newsletter](12-contact-newsletter.md) — segment by audience (general vs. donor), don't build two newsletter systems.
