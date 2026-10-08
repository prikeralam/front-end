import { APPLICATION_KINDS, type ApplicationKind } from "../apply/applyTypes";
import type { components } from "./schema";

export type ApiApplication = components["schemas"]["Application"];

export type ApplicationStatus = "new" | "reviewed";

export type ApplicationRow = {
  id: number;
  kind: ApplicationKind;
  /** The role's title for job applications, else null. */
  jobTitle: string | null;
  fullName: string;
  email: string;
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
    status: a.status === "reviewed" ? "reviewed" : "new",
    createdAt: a.created_at,
    handledAt: a.handled_at ?? null,
    handledBy: a.handled_by ?? null,
  };
}
