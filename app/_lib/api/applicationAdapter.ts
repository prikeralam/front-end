import { APPLICATION_KINDS, type ApplicationKind } from "../apply/applyTypes";
import type { components } from "./schema";

export type ApiApplication = components["schemas"]["Application"];

export type ApplicationStatus = "new" | "reviewed";

/** The files staff can open on an application (website-backend `files/<document>/`). Kept here, not in the actions
 * file: a "use server" module may export only async functions, and any other export breaks every action in it. */
export const APPLICATION_DOCUMENTS = ["cv", "cover_letter", "writing_sample"] as const;
export type ApplicationDocument = (typeof APPLICATION_DOCUMENTS)[number];

export type ApplicationRow = {
  id: number;
  kind: ApplicationKind;
  /** The role's title for job applications, else null. */
  jobTitle: string | null;
  fullName: string;
  email: string;
  /** Whether the applicant sent a writing sample (optional for most roles). */
  hasWritingSample: boolean;
  status: ApplicationStatus;
  createdAt: string;
  handledAt: string | null;
  handledBy: number | null;
};

export function toApplicationRow(a: ApiApplication): ApplicationRow {
  return {
    id: a.id,
    kind: (APPLICATION_KINDS as readonly string[]).includes(a.kind) ? (a.kind as ApplicationKind) : "fellowship",
    jobTitle: a.job_title ?? null,
    fullName: a.full_name,
    email: a.email,
    hasWritingSample: a.has_writing_sample ?? false,
    status: a.status === "reviewed" ? "reviewed" : "new",
    createdAt: a.created_at,
    handledAt: a.handled_at ?? null,
    handledBy: a.handled_by ?? null,
  };
}
