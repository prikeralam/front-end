# Spec: About PRI

**Site section #2** · Status: Drafted · Depends on: [Backend Module A — CMS](../backend/A-content-management-system.md)

## Problem Statement

Funders, partners, regulators, and journalists routinely need to verify who PRI actually is before they'll engage: is it a legally registered, tax-exempt, governed institution, who runs it, and what has it committed to strategically. Right now there is no single, authoritative page answering "who is PRI, who governs it, and is it legitimate" — which stalls due-diligence conversations with donors and partners and undermines credibility with anyone doing basic verification before citing or funding PRI's work.

## Solution

An "About PRI" page that lays out the institutional overview, governance structure (Executive Council, Steering Council, Director's Note), an organizational chart, legal/tax status documentation (society registration, 12A/80G certifications), and links to annual reports and strategic plans — all sourced from CMS-managed content and documents so it can be kept current (new council members, new annual report) without a code change.

## User Stories

1. As a prospective donor doing due diligence, I want to see PRI's legal registration and 12A/80G tax-exemption status, so that I can confirm donations are compliant and tax-deductible before committing funds.
2. As a partner organization, I want to see PRI's governance structure (Executive Council, Steering Council), so that I understand who has decision-making authority before entering a formal collaboration.
3. As a visitor, I want to read a Director's Note, so that I get a personal, credible voice behind the institution rather than only institutional copy.
4. As a visitor, I want to see an organizational chart, so that I understand how PRI is structured and who leads which function.
5. As a journalist or researcher, I want to download PRI's annual reports and strategic plans, so that I can cite or verify PRI's activities and priorities.
6. As a comms/admin staff member (Editor role), I want to update governance member listings, the org chart, and upload new annual reports through the CMS, so that the page stays accurate as leadership or documents change without a developer.
7. As a visitor using a screen reader, I want the governance and legal sections to have proper heading hierarchy and document links with descriptive text (not "click here"), so that I can navigate and understand the page non-visually.
8. As a mobile visitor, I want the org chart and governance tables to remain legible on a small screen, so that I'm not forced to zoom or lose information.
9. As a Malayalam-speaking visitor, I want core "About PRI" copy (mission overview, Director's Note) available via the site's language toggle, so that I can read it in my preferred language.

## Implementation Decisions

- **Sections, top to bottom:** Institutional Overview → Director's Note → Governance (Executive Council, Steering Council listings) → Organizational Chart (image/diagram, CMS-uploaded asset) → Legal Status (registration number, 12A/80G certificate references/downloads) → Annual Reports & Strategic Plans (document list, most recent first, downloadable PDFs).
- **Content types needed from Module A:** (a) a generic "page content block" type for Overview/Director's Note prose (reuses the same content-block mechanism as the homepage hero), (b) a "person/role" content type for governance members (name, role, council, optional photo/bio) distinct from the "author profile" type used elsewhere in the doc for research authors — flagged here as a modeling decision for Module A: decide whether governance members and research authors share one "person" model or are separate, since both exist in the source doc.
- **Document library:** annual reports and strategic plans are files (PDFs) with metadata (title, year, type) — this reuses Module A's document/media handling rather than inventing a separate system, since Module A already needs Draft→Review→Approve→Publish workflow for uploaded content.
- **Org chart:** treated as a single uploaded image/diagram asset managed by an Editor, not a dynamically generated chart — simplest option consistent with the source doc, which doesn't call for interactivity here (contrast with the Data Repository's interactive maps, which are explicitly requested).
- **Legal status display:** registration number and certification references are structured fields (not free text) so they can be reused elsewhere (e.g. Donors & Sponsors Forum's "financial transparency tools" in a future phase) without re-entry.

## Testing Decisions

Deferred — no code or test infrastructure exists yet. Revisit at implementation time to define external-behavior tests for: governance listing renders from CMS data, document downloads resolve to the correct/current file, and legal-status fields display accurately. Follow whatever testing pattern gets established on the first-built module (likely Module A or the Homepage) rather than inventing a new one here.

## Out of Scope

- Interactive/dynamic org chart rendering — static asset only, per Implementation Decisions above.
- Full donor financial-transparency tooling (belongs to §9 Donors & Sponsors Forum, future phase) — legal-status fields are modeled here but not built out into a transparency dashboard.
- Multi-version history/diffing of annual reports — only the current list of published reports is shown; versioning is a CMS-level concern already covered by Module A's Draft→Review→Approve→Publish workflow, not a per-report feature.
- Author profiles for researchers/fellows (belongs to §3 Research & Publications Hub / §5 Fellowship Portal, future phases) — only governance-member profiles are in scope here.

## Further Notes

- Source: docx §2 "About PRI" — "Institutional overview; Governance (Executive Council, Steering Council, Director's Note); Organizational chart; Legal status (society registration, 12A/80G certifications); Annual reports and strategic plans."
- The person/role content-type question (governance members vs. research authors — one model or two) should be resolved explicitly when Module A is specced next, since it affects both this page and future Research Hub / Fellowship pages.
