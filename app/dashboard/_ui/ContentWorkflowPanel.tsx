"use client";

import { useState } from "react";
import { deleteCmsAction, transitionCmsAction } from "../../_lib/dashboard/cmsActions";
import type { CmsMutation, CmsRecord, WorkflowStatus } from "../../_lib/cms/types";
import { canContributeContent, canReviewDrafts, type Session } from "../../_lib/session";
import { ImageIcon } from "./icons";
import StatusBadge from "./StatusBadge";
import { MoreMenu, type MenuAction } from "./console";

type Action = MenuAction;

/** What a reviewer can do next. The backend checks the role again on every transition. */
function reviewActions(status: WorkflowStatus): { label: string; next: WorkflowStatus }[] {
  switch (status) {
    case "in_review":
      return [{ label: "Approve", next: "approved" }, { label: "Send back to draft", next: "draft" }];
    case "approved":
      return [{ label: "Publish", next: "published" }];
    case "published":
      return [{ label: "Unpublish", next: "unpublished" }];
    case "unpublished":
      return [{ label: "Republish", next: "published" }];
    default:
      return [];
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const rowButton = "rounded-md border border-[#d9ddea] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#3a4263] hover:bg-[#f3f5fa] disabled:cursor-not-allowed disabled:opacity-50";
const nextButton = "rounded-md bg-[#253D9A] px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-50";

/**
 * The list for one content type: thumbnail (where the type has images), title, status, last change, and the actions
 * this role may take. Editing happens in the parent's drawer (`onEdit`). The backend enforces every rule again.
 */
export default function ContentWorkflowPanel({
  records,
  session,
  showImages,
  onEdit,
  onChanged,
}: {
  records: CmsRecord[];
  session: Session;
  showImages: boolean;
  onEdit: (record: CmsRecord) => void;
  onChanged: () => void;
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canReview = canReviewDrafts(session);
  const canSubmit = canContributeContent(session);

  const isOwn = (r: CmsRecord) => session.id !== undefined && r.createdBy === session.id;
  // Mirrors the backend: contributors edit their own drafts; editors and admins edit anything.
  const canEdit = (r: CmsRecord) => canReview || (isOwn(r) && canSubmit && r.status === "draft");

  async function run(r: CmsRecord, action: () => Promise<CmsMutation>) {
    setBusyKey(r.key);
    setError(null);
    const result = await action().catch((): CmsMutation => ({ ok: false, message: "We couldn't reach the server. Please try again." }));
    setBusyKey(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onChanged();
  }

  const transition = (r: CmsRecord, next: WorkflowStatus) => run(r, () => transitionCmsAction(r.type, r.key, next));

  function remove(r: CmsRecord) {
    if (!window.confirm(`Delete "${r.title}"? This can't be undone.`)) return;
    run(r, () => deleteCmsAction(r.type, r.key));
  }

  return (
    <div>
      <div role="alert" className={error ? "mb-3 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 px-3 py-2.5 text-[13px] text-[#8a3a22]" : "sr-only"}>
        {error ?? ""}
      </div>
      <div className="overflow-hidden rounded-xl border border-[#e3e6f0] bg-white shadow-[0_1px_2px_rgba(23,26,43,0.04)]">
        <div className="hidden grid-cols-[minmax(0,1fr)_120px_110px_210px] gap-4 border-b border-[#e3e6f0] bg-[#fafbfd] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7d86a8] md:grid">
          <span>Name</span>
          <span>Status</span>
          <span>Updated</span>
          <span className="sr-only">Actions</span>
        </div>
        <ul className="divide-y divide-[#edf0f6]">
          {records.map((r) => {
            const busy = busyKey === r.key;
            const review = canReview ? reviewActions(r.status) : [];
            // Reviewers may send any draft back to review (e.g. a pipeline dataset returned to draft), authors their own.
            const submit = r.status === "draft" && (canReview || (isOwn(r) && canSubmit)) ? [{ label: "Submit for review", next: "in_review" as WorkflowStatus }] : [];
            // Only a step forward gets the solid button; stepping back (unpublish, back to draft) sits in the menu.
            const steps = [...submit, ...review];
            const next = steps.find((a) => a.next !== "draft" && a.next !== "unpublished");
            const otherSteps = steps.filter((a) => a !== next);
            const more: Action[] = [
              ...otherSteps.map((a) => ({ label: a.label, run: () => transition(r, a.next) })),
              ...(r.fileUrl ? [{ label: "Open file", run: () => window.open(r.fileUrl, "_blank", "noopener,noreferrer") }] : []),
              ...(canReview ? [{ label: "Delete", run: () => remove(r), danger: true }] : []),
            ];

            return (
              <li key={`${r.type}-${r.key}`} className={`grid grid-cols-1 items-center gap-3 px-5 py-3 transition-colors hover:bg-[#fafbfd] md:grid-cols-[minmax(0,1fr)_120px_110px_210px] md:gap-4 ${busy ? "opacity-60" : ""}`}>
                <div className="flex min-w-0 items-center gap-3">
                  {showImages && (
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg ${r.imageUrl ? "bg-[#eef1f9]" : "border border-dashed border-[#d3d8e8] bg-[#fafbfd]"}`} title={r.imageUrl ? undefined : "No image yet"}>
                      {r.imageUrl ? (
                        // Images come from the storage bucket (presigned) or any linked host.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon width={18} height={18} className="text-[#b3bad2]" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    {canEdit(r) ? (
                      <button type="button" onClick={() => onEdit(r)} className="block max-w-full truncate text-left text-[14px] font-semibold text-[#171a2b] hover:text-[#253D9A] hover:underline">
                        {r.title}
                      </button>
                    ) : (
                      <p className="truncate text-[14px] font-semibold text-[#171a2b]">{r.title}</p>
                    )}
                    <p className="mt-0.5 truncate text-[12.5px] text-[#7d86a8]">
                      {[r.subtitle, isOwn(r) ? "by you" : `by user #${r.createdBy}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="font-[family-name:var(--font-mono)] text-[12px] text-[#5b6280]">{formatDate(r.updatedAt)}</p>
                <div className="flex items-center gap-1.5 md:justify-end">
                  {next && (
                    <button type="button" disabled={busy} onClick={() => transition(r, next.next)} className={nextButton}>
                      {next.label}
                    </button>
                  )}
                  {canEdit(r) && (
                    <button type="button" disabled={busy} onClick={() => onEdit(r)} className={rowButton}>
                      Edit
                    </button>
                  )}
                  <MoreMenu actions={more} disabled={busy} buttonClassName={rowButton} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
