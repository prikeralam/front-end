/** What an application can be for, as the backend names them, with the labels the form shows. */
export const APPLICATION_KINDS = ["fellowship", "internship", "job"] as const;
export type ApplicationKind = (typeof APPLICATION_KINDS)[number];
export const applicationKindLabels: Record<ApplicationKind, string> = {
  fellowship: "Fellowship",
  internship: "Internship",
  job: "A job opening",
};

/** CVs, cover letters and writing samples: the same limits the backend enforces. */
export const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx"] as const;
export const DOCUMENT_ACCEPT = ".pdf,.doc,.docx";
export const DOCUMENT_MAX_MB = 5;

export type ApplicationField = "kind" | "job" | "full_name" | "email" | "cv" | "cover_letter" | "writing_sample";

/** Whether a job opening asks for a writing sample (website-backend `JobOpening.writing_sample`). */
export type WritingSample = "optional" | "required";
export type ApplicationResult = { ok: true } | { ok: false; message: string; fieldErrors?: Partial<Record<ApplicationField, string>> };
