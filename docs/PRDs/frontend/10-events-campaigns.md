# Spec: Events & Campaigns

**Site section #10** · Status: Drafted · Future phase — not yet prioritized for build · Depends on: [Backend Module G — Forms, Surveys & Contact Management](../backend/G-forms-surveys-contact-management.md) (registration), [Backend Module A — CMS](../backend/A-content-management-system.md) (event content)

## Problem Statement

PRI runs webinars, launches, workshops, and advocacy days, but without a public events page there's no way for the public to discover upcoming events, register, or revisit what happened at past ones — and internally, there's no shared calendar tying event content to the rest of PRI's editorial/comms planning. This limits attendance, loses the archival value of past events (recordings, photos, reports), and forces registration to happen through ad hoc, non-integrated channels.

## Solution

A page listing upcoming events (webinars, launches, workshops, advocacy days) with registration forms that auto-confirm, an archive of past events (videos, photos, reports), and an integrated calendar for internal planning.

## User Stories

1. As a visitor, I want to see a list of upcoming events with dates, times, and descriptions, so that I can decide which to attend.
2. As a visitor, I want to register for an event through a form, so that I don't need to email or call to reserve a spot.
3. As a registrant, I want an automatic confirmation (on-screen and/or email) after registering, so that I know I'm signed up without waiting on a manual reply.
4. As a visitor, I want to browse an archive of past events with videos, photos, and reports, so that I can revisit or catch up on events I missed.
5. As a visitor, I want to filter events by type (webinar, launch, workshop, advocacy day) or by date, so that I can find relevant events quickly.
6. As an Editor/Comms staff member, I want to create and publish a new event listing through the CMS, so that upcoming events go live without developer involvement.
7. As an Editor, I want to attach recordings, photos, and a report to an event after it happens, so that it moves cleanly from "upcoming" to "past" with its archive materials in place.
8. As an internal staff member, I want an integrated calendar view of all events for internal planning, so that scheduling conflicts and gaps are visible across teams (this may be an internal-only view, not necessarily public-facing — flagged as a build-time decision).
9. As a mobile visitor, I want the event registration form to work smoothly on a mobile browser, so that I can register on the go.
10. As a visitor using a screen reader, I want event dates, times, and registration form fields to be properly labeled, so that I can register independently.
11. As an Admin, I want to see how many people registered for an event, so that I can plan capacity/logistics.
12. As a registrant, I want to receive a reminder as the event approaches (if applicable), so that I don't forget to attend — flagged as an optional enhancement, not explicit in the source doc.

## Implementation Decisions

- **Event content type (Module A):** `Event` (title, description, type, date/time, location/link, status: upcoming/past) with attached archive materials (video links, photo gallery, report document) once past — reuses Module A's Document handling for the report attachment rather than a new file system.
- **Registration:** built through Module G's form system (per the source doc explicitly listing "event registration" under Module G's forms), not a bespoke registration backend — auto-confirmation is Module G's responsibility (confirmation email/message on submit).
- **Calendar:** the source doc frames this as "for internal planning," so the primary calendar view is treated as an internal/admin tool over the same `Event` data, not a public feature; the public page instead shows upcoming/past lists. If a public calendar view is wanted later, it can be built as an alternate rendering of the same `Event` list — no new backend needed.
- **API contract:** `GET /api/events/?type=&status=upcoming|past&from=&to=` (listing/filter), `GET /api/events/{slug}/` (detail incl. archive materials for past events), `POST /api/forms/event-registration/{event_id}/` (Module G).

## Testing Decisions

Deferred — no code yet. When built, verify that registration submissions are correctly tied to the specific event (no cross-event mixups) and that auto-confirmation fires reliably — the Module G-level guarantee this page depends on.

## Out of Scope

- Ticketing/paid event registration — the source doc doesn't mention payment for events (contrast with the Donors Forum's donation flow); assume free registration unless told otherwise.
- Full internal event-planning/calendar tooling (resource booking, staff assignment) — only the "integrated calendar for internal planning" bullet is acknowledged; deeper planning tools are out of scope unless specified later.
- Automated event reminders — noted as a possible enhancement in User Stories but not in the source doc; not committed to here.

## Further Notes

- Source: docx §10 "Events & Campaigns" — "Upcoming events: Webinars, launches, workshops, advocacy days; Registration forms with auto-confirmation; Past events archive (videos, photos, reports); Integrated calendar for internal planning."
- Registration reuses [Module G](../backend/G-forms-surveys-contact-management.md), which the source doc explicitly names as owning "event registration" among its form types — do not build a separate registration system in Module A.
- Event snapshots from policy roundtables, described under [Advocacy & Policy Engagement](06-advocacy-policy-engagement.md) (§6), are a lighter-weight recap type and should stay distinct from full `Event` entries here to avoid duplicate modeling — confirm the distinction holds when both sections are built.
