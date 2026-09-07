# Spec: Fellowship & Internship Portal

**Site section #5** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module D — Fellowship/Internship Management System](../backend/D-fellowship-internship-management-system.md), [Backend Module A — CMS](../backend/A-content-management-system.md) (fellow profiles, impact stories)

## Problem Statement

Prospective fellows and interns have no way to learn about PRI's programs, timelines, or how to apply, and PRI has no digital application intake — meaning applications likely arrive ad hoc (email, forms elsewhere) with no consistent tracking. Past and current fellows also have no public showcase, so PRI can't demonstrate program impact to prospective applicants or donors.

## Solution

A portal describing fellowship/internship programs and timelines, an integrated online application system (forms + document upload), public profiles of current and past fellows with their impact stories and publications, and a feedback/testimonial submission form for fellows to share their experience.

## User Stories

1. As a prospective fellow, I want to see an overview of available programs and their timelines (application windows, program dates), so that I know if and when I can apply.
2. As a prospective fellow, I want to fill out an application form with document upload (CV, writing sample, etc.), so that I can apply without emailing documents manually.
3. As an applicant, I want confirmation that my application was received, so that I know it went through.
4. As a visitor, I want to browse profiles of current and past fellows, so that I can gauge program quality and fit before applying.
5. As a visitor, I want to read impact stories and see publications produced by fellows, so that I understand what the program actually produces.
6. As a current or past fellow, I want to submit feedback or a testimonial about my experience, so that my perspective can inform program improvement and public messaging (and feed the Homepage testimonials, per §1).
7. As a Reviewer (selection committee member), I want a dashboard listing applicants with filtering, so that I can efficiently review and shortlist candidates.
8. As an applicant, I want to receive automatic status emails (confirmation, shortlisting, rejection, onboarding), so that I'm kept informed without needing to follow up manually.
9. As an Editor/Comms staff member, I want to publish a fellow's profile page (bio, photo, publications, impact story) once they're onboarded, so that the public showcase stays current.
10. As a mobile applicant, I want the application form (including file upload) to work on a mobile browser, so that I'm not required to use a desktop to apply.
11. As a visitor using a screen reader, I want the application form fields and file-upload controls to be properly labeled, so that I can complete an application independently.
12. As an Admin, I want applicant data stored securely and only visible to the relevant reviewers, so that sensitive application materials aren't exposed beyond the selection committee.

## Implementation Decisions

- **Page structure:** Program overview + timeline → "Apply now" CTA leading to the application form → Current/Past Fellows gallery (profile cards) → Fellow detail page (bio, impact story, linked publications) → Feedback/testimonial submission form.
- **Application form:** built via Module D's form-builder rather than hardcoded fields, so program-specific questions can change per cycle without a frontend code change; file upload fields map to Module D's document storage.
- **Fellow profiles:** reuse Module A's `PersonProfile` model (same one used for governance in About PRI and authors in the Publications Hub) grouped as "fellow"/"past fellow", with a link from the profile to that person's publications (Module B) — avoids yet another profile model.
- **Feedback/testimonial form:** submissions create a `Testimonial` (Module A model, same one powering the Homepage) in a pending/unapproved state, requiring Editor approval before appearing publicly — reuses existing content workflow rather than inventing a separate feedback pipeline.
- **API contract:** `GET /api/programs/` (overview/timelines, Module D), `POST /api/applications/` (submission, Module D), `GET /api/people/?group=fellow` (gallery, Module A), `GET /api/people/{id}/` + `GET /api/people/{id}/publications/` (fellow detail), `POST /api/testimonials/` (feedback submission, Module A, defaults to unapproved).
- **Reviewer dashboard** is an internal/admin-only view (Module D), not part of this public-facing spec beyond noting it exists as a dependency.

## Testing Decisions

Deferred — no code yet. Prioritize testing the application submission → status-email pipeline (an application in a given state must trigger the correct email, and only that one) and access control on applicant data (only Reviewer/Admin roles can view submissions), once Module D exists to test against.

## Out of Scope

- Selection-committee review UI/workflow mechanics — owned by Module D's spec, not the public portal.
- Payment or stipend processing for fellows — not mentioned in the source doc for this section.
- Alumni networking features (beyond a static past-fellows showcase) — not requested in the source doc.

## Further Notes

- Source: docx §5 "Fellowship & Internship Portal" — "Overview of programs and timelines; Application system (integrated forms + document upload); Profiles of current and past fellows; Impact stories and publications from fellows; Feedback/testimonial submission form."
- Fellow profiles reuse the `PersonProfile` model decision from [Module A](../backend/A-content-management-system.md); testimonials reuse the `Testimonial` model from [Homepage](01-homepage.md) — submissions here feed the same pool Homepage draws from.
- Publication linking depends on [Research & Publications Hub](03-research-publications-hub.md) existing (or at least Module B) to have something to link to.
