# Spec: Get Involved

**Site section #11** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module G — Forms, Surveys & Contact Management](../backend/G-forms-surveys-contact-management.md), [Backend Module A — CMS](../backend/A-content-management-system.md) (job listings)

## Problem Statement

People who want to support PRI beyond donating — volunteers, job seekers, mailing-list subscribers, and people who want to flag a concern (including anonymously) — have no single, discoverable path to do any of that. Without this, PRI likely loses willing volunteers and applicants who don't know how to reach out, and has no formal, safe channel for whistleblower-type reports.

## Solution

A page offering volunteer and intern application forms, a recruitment/job board listing, an option to join the mailing list or media briefings, and a suggestions/whistleblower form with an anonymity option.

## User Stories

1. As a prospective volunteer, I want to fill out a volunteer form, so that I can offer my time/skills to PRI.
2. As a prospective intern, I want to fill out an intern form, so that I can apply without necessarily going through the full Fellowship Portal (§5) flow — flagged as needing clarification on whether this duplicates or complements §5's application system.
3. As a job seeker, I want to browse a listing of open roles at PRI, so that I can find and apply for relevant positions.
4. As a visitor, I want to join PRI's general mailing list or request media briefings, so that I stay informed without needing to check the site regularly.
5. As a visitor, I want to submit a suggestion, so that I can offer feedback or ideas to PRI.
6. As someone with a sensitive concern, I want to submit a whistleblower-type report with an option to remain anonymous, so that I can raise an issue without fear of identification.
7. As an Admin, I want anonymous submissions to be technically unlinkable to a submitter identity, so that the anonymity promise is real, not just a UI label.
8. As an Admin, I want form submissions (volunteer, intern, suggestion, whistleblower) routed to the correct internal recipient, so that each type reaches the right team promptly.
9. As an Editor/HR staff member, I want to post and update job listings through the CMS, so that the job board stays current without developer involvement.
10. As a mobile visitor, I want all forms on this page (especially the whistleblower form) to work reliably on mobile, so that reporting isn't blocked by device.
11. As a visitor using a screen reader, I want every form on this page to be properly labeled, including the anonymity option, so that I can use them independently of visual cues.
12. As an Admin, I want whistleblower submissions handled with stricter access control than ordinary form submissions, so that sensitive reports aren't broadly visible internally.

## Implementation Decisions

- **Forms, all via Module G:** volunteer, intern-interest, suggestion, and whistleblower forms are four separate Module G form definitions, each with its own routing rule — not one generic "contact" form, since routing and access-control needs differ sharply (especially for whistleblower).
- **Anonymity for whistleblower submissions:** when anonymous is selected, no identifying metadata (name, email, IP, session) is stored against the submission — this is an explicit Module G requirement for this form type, not just a hidden/optional field, and should be verified at the storage layer, not only the UI.
- **Whistleblower access control:** submissions route to a restricted recipient set (narrower than Module G's default email-routing pattern), and are excluded from any general "form submissions export" tooling Module G might offer for other forms — flagged as a Module G spec detail to get right when that module is built.
- **Job board:** a `JobListing` content type in Module A (title, description, location, application link/instructions, status: open/closed) rather than a Module G form — listings are published content, not form submissions.
- **Mailing list / media briefings sign-up:** reuses the same newsletter mechanism as Contact & Newsletter (§12) and the Donors Forum (§9), tagged with a "general" or "media" segment.
- **Intern form vs. Fellowship Portal overlap:** flagged as an open product question (see Further Notes) rather than resolved here — don't build two separate intern-application pipelines without confirming with stakeholders which one is canonical.
- **API contract:** `POST /api/forms/volunteer/`, `POST /api/forms/intern-interest/`, `POST /api/forms/suggestion/`, `POST /api/forms/whistleblower/` (all Module G, last one with the anonymity guarantee above), `GET /api/jobs/?status=open` (Module A), `POST /api/newsletter/signup/?segment=general|media` (Module G).

## Testing Decisions

Deferred — no code yet. The whistleblower form's anonymity guarantee is the highest-stakes thing on this page to test correctly once built: verify that an anonymous submission genuinely stores no identifying data end-to-end (not just that the UI hides a name field), before testing anything else here.

## Out of Scope

- Volunteer scheduling/shift management — the doc only asks for an intake form, not a volunteer-management system.
- Applicant tracking for job-board roles (beyond linking out to an application) — full ATS functionality isn't specified; the job board here is a listing, not a hiring pipeline.
- Encrypted/anonymous messaging infrastructure beyond "don't store identifying data" — no end-to-end encryption or anonymous return-messaging is specified in the source doc.

## Further Notes

- Source: docx §11 "Get Involved" — "Volunteer and intern forms; Recruitment listings and job board; Invite to join mailing list or media briefings; Suggestions or whistleblower form (with option for anonymity)."
- **Needs stakeholder clarification:** whether the "intern form" here is the same intake as the Fellowship & Internship Portal's (§5) application system, or a separate, lighter-weight expression-of-interest form. Resolve before building either §5 or this section, to avoid duplicate/conflicting intake pipelines.
- Shares the newsletter mechanism used by [Donors & Sponsors Forum](09-donors-sponsors-forum.md) and [Contact & Newsletter](12-contact-newsletter.md) — segment by audience, one system.
