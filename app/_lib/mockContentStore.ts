/**
 * Generalized, client-side, localStorage-backed CMS workflow store — the
 * Module A/B analog of mockAuth.ts's DraftDataset pattern, but shared across
 * every content type instead of copy-pasted per type. Same caveats apply:
 * no backend yet, single-browser only, exists purely to demo the intended
 * Draft → In Review → Approved → Published (→ Unpublished) workflow (see
 * docs/PRDs/backend/A-content-management-system.md).
 */
import type { ContentBlock, Testimonial, Person, PRIDocument, Publication, Partner } from "./types";
import type { HeroProject } from "../_content/projects";
import { canContributeContent, canReviewDrafts, type MockSession } from "./mockAuth";

export type WorkflowStatus = "draft" | "in_review" | "approved" | "published" | "unpublished";

export const workflowStatusLabel: Record<WorkflowStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  published: "Published",
  unpublished: "Unpublished",
};

export type ContentTypeKey = "content-block" | "testimonial" | "person-profile" | "partner" | "document" | "project" | "publication";

export const contentTypeLabel: Record<ContentTypeKey, string> = {
  "content-block": "Content block",
  testimonial: "Testimonial",
  "person-profile": "Person profile",
  partner: "Partner",
  document: "Document",
  project: "Project",
  publication: "Publication",
};

/** Maps each ContentTypeKey to the shape of its `data` payload. */
export type ContentDataFor<K extends ContentTypeKey> = K extends "content-block"
  ? ContentBlock
  : K extends "testimonial"
    ? Testimonial
    : K extends "person-profile"
      ? Person
      : K extends "partner"
        ? Partner
        : K extends "document"
          ? PRIDocument
          : K extends "project"
            ? HeroProject
            : Publication;

export type WorkflowRecord<T = unknown> = {
  id: string;
  contentType: ContentTypeKey;
  data: T;
  workflowStatus: WorkflowStatus;
  submittedByEmail: string;
  submittedByName: string;
  submittedAt: string;
  updatedAt: string;
  reviewerEmail?: string;
  reviewNote?: string;
};

function keyFor(type: ContentTypeKey) {
  return `pri_mock_content_${type}`;
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore — private browsing / storage disabled
  }
}

export function listRecords<K extends ContentTypeKey>(type: K): WorkflowRecord<ContentDataFor<K>>[] {
  return readJSON<WorkflowRecord<ContentDataFor<K>>[]>(keyFor(type), []);
}

export function getRecord<K extends ContentTypeKey>(type: K, id: string): WorkflowRecord<ContentDataFor<K>> | null {
  return listRecords(type).find((r) => r.id === id) ?? null;
}

function saveAll<K extends ContentTypeKey>(type: K, records: WorkflowRecord<ContentDataFor<K>>[]) {
  writeJSON(keyFor(type), records);
}

export function createDraft<K extends ContentTypeKey>(
  type: K,
  data: ContentDataFor<K>,
  session: MockSession
): WorkflowRecord<ContentDataFor<K>> {
  const records = listRecords(type);
  const now = new Date().toISOString();
  const record: WorkflowRecord<ContentDataFor<K>> = {
    id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    contentType: type,
    data,
    workflowStatus: "draft",
    submittedByEmail: session.email,
    submittedByName: session.name,
    submittedAt: now,
    updatedAt: now,
  };
  saveAll(type, [...records, record]);
  return record;
}

export function updateDraft<K extends ContentTypeKey>(type: K, id: string, data: Partial<ContentDataFor<K>>) {
  const records = listRecords(type).map((r) =>
    r.id === id ? { ...r, data: { ...r.data, ...data }, updatedAt: new Date().toISOString() } : r
  );
  saveAll(type, records);
}

export function deleteDraft<K extends ContentTypeKey>(type: K, id: string) {
  saveAll(type, listRecords(type).filter((r) => r.id !== id));
}

/**
 * Applies a workflow transition, enforcing the same rule as Module A's spec:
 * a contributor (researcher/editor/admin) may move their own record from
 * draft → in_review; any other transition (in_review → approved,
 * approved → published, published → unpublished, or reviewing someone
 * else's draft) requires an Editor/Admin reviewer role.
 */
export function transition<K extends ContentTypeKey>(
  type: K,
  id: string,
  next: WorkflowStatus,
  session: MockSession,
  note?: string
): { ok: true } | { ok: false; reason: string } {
  const record = getRecord(type, id);
  if (!record) return { ok: false, reason: "Record not found." };

  const isOwnDraftSubmit =
    record.workflowStatus === "draft" &&
    next === "in_review" &&
    record.submittedByEmail === session.email &&
    canContributeContent(session);
  const isReviewerAction = canReviewDrafts(session);

  if (!isOwnDraftSubmit && !isReviewerAction) {
    return { ok: false, reason: "You don't have permission to make this change." };
  }

  const records = listRecords(type).map((r) =>
    r.id === id
      ? {
          ...r,
          workflowStatus: next,
          updatedAt: new Date().toISOString(),
          reviewerEmail: isReviewerAction ? session.email : r.reviewerEmail,
          reviewNote: note ?? r.reviewNote,
        }
      : r
  );
  saveAll(type, records);
  return { ok: true };
}

export const ALL_CONTENT_TYPES: ContentTypeKey[] = [
  "content-block",
  "testimonial",
  "person-profile",
  "partner",
  "document",
  "project",
  "publication",
];
