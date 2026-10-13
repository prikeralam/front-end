import type { AccessState } from "./datasetTypes";
import type { Session } from "./session";

export type DownloadStep =
  /** Still finding out who is signed in, or fetching what they may download. */
  | "checking"
  | "files"
  | "no-file"
  /** Signed out: Download opens the sign-in / create-account dialog. */
  | "sign-in"
  /** Signed in with an unconfirmed email: downloads wait for the emailed link. */
  | "confirm-email"
  /** Signed out on an on-request dataset: requesting access needs an account. */
  | "sign-in-to-request"
  | "request"
  | "locked";

/**
 * What a dataset's download panel shows. `session` is undefined while being checked and null when signed out; the
 * backend decides `accessState` (it only sends files the visitor may have), this only picks the matching step.
 */
export function downloadStep(accessState: AccessState, fileCount: number, session: Session | null | undefined): DownloadStep {
  if (accessState === "full") return fileCount > 0 ? "files" : "no-file";
  if (accessState === "locked") return "locked";
  if (session === undefined) return "checking";
  if (accessState === "requestable") return session ? "request" : "sign-in-to-request";
  if (!session) return "sign-in";
  // Signed in and confirmed, but the files haven't come back yet (they are being fetched for this account).
  return session.emailVerified === false ? "confirm-email" : "checking";
}
