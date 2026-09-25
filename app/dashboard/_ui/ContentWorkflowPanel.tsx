"use client";

import { useState } from "react";
import { deleteCmsAction, transitionCmsAction, updateCmsAction } from "../../_lib/dashboard/cmsActions";
import { RESOURCES } from "../../_lib/cms/resources";
import { workflowStatusLabel, type CmsMutation, type CmsRecord, type FieldOption, type WorkflowStatus } from "../../_lib/cms/types";
import { canContributeContent, canReviewDrafts, type Session } from "../../_lib/session";
import { SectionHeading, EmptyState } from "../../_ui/kit";
import SimpleDraftForm from "./SimpleDraftForm";

const statusColor: Record<WorkflowStatus, string> = {
  draft: "bg-[#8b8fa3]/10 text-[#5b5f74]",
  in_review: "bg-[#E4633F]/10 text-[#E4633F]",
  approved: "bg-[#C9972C]/10 text-[#C9972C]",
  published: "bg-[#253D9A]/10 text-[#253D9A]",
  unpublished: "bg-[#8b8fa3]/10 text-[#5b5f74]",
};

/** What a reviewer can do next. The backend checks the role again on every transition. */
function nextActions(status: WorkflowStatus): { label: string; next: WorkflowStatus }[] {
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

const pillButton = "rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export default function ContentWorkflowPanel({
  records,
  session,
  dynamicOptions,
  onChanged,
}: {
  records: CmsRecord[];
  session: Session;
  dynamicOptions?: Record<string, FieldOption[]>;
  onChanged: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
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
      return false;
    }
    onChanged();
    return true;
  }

  const handleTransition = (r: CmsRecord, next: WorkflowStatus) => run(r, () => transitionCmsAction(r.type, r.key, next));

  async function handleDelete(r: CmsRecord) {
    if (!window.confirm("Delete this item? This can't be undone.")) return;
    await run(r, () => deleteCmsAction(r.type, r.key));
  }

  async function handleSave(r: CmsRecord, form: FormData): Promise<CmsMutation> {
    const result = await updateCmsAction(r.type, r.key, form);
    if (result.ok) {
      setEditingKey(null);
      onChanged();
    }
    return result;
  }

  if (records.length === 0) return <EmptyState message="Nothing here yet — use the form above to create one." />;

  return (
    <div>
      <SectionHeading>All items</SectionHeading>
      <div role="alert" className={error ? "mt-4 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] text-[#5b5f74]" : "sr-only"}>
        {error ?? ""}
      </div>
      <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
        {records.map((r) => {
          const busy = busyKey === r.key;
          const canSubmitThisDraft = r.status === "draft" && isOwn(r) && canSubmit;
          return (
            <li key={`${r.type}-${r.key}`} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[15px] font-semibold text-[#171a2b]">{r.title}</p>
                  {r.subtitle && <p className="mt-1 text-[12px] text-[#8b8fa3]">{r.subtitle}</p>}
                  <p className="mt-1 text-[12px] text-[#8b8fa3]">
                    {isOwn(r) ? "created by you" : `created by user #${r.createdBy}`}
                    {r.fileUrl && (
                      <>
                        {" · "}
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#253D9A] hover:underline">
                          view file
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {canSubmitThisDraft && (
                    <button disabled={busy} onClick={() => handleTransition(r, "in_review")} className={pillButton}>
                      Submit for review
                    </button>
                  )}
                  {canReview &&
                    nextActions(r.status).map((a) => (
                      <button key={a.label} disabled={busy} onClick={() => handleTransition(r, a.next)} className={pillButton}>
                        {a.label}
                      </button>
                    ))}
                  {canEdit(r) && (
                    <button
                      onClick={() => setEditingKey(editingKey === r.key ? null : r.key)}
                      className="rounded-full border border-[#dcdee8] px-3 py-1.5 text-[12px] font-semibold text-[#5b5f74] hover:bg-[#f0f1f5]"
                    >
                      {editingKey === r.key ? "Close" : "Edit"}
                    </button>
                  )}
                  {canReview && (
                    <button
                      disabled={busy}
                      onClick={() => handleDelete(r)}
                      className="rounded-full border border-[#E4633F]/40 px-3 py-1.5 text-[12px] font-semibold text-[#E4633F] hover:bg-[#E4633F]/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[r.status]}`}>
                    {workflowStatusLabel[r.status]}
                  </span>
                </div>
              </div>
              {editingKey === r.key && (
                <div className="mt-4">
                  <SimpleDraftForm
                    title="Edit"
                    fields={RESOURCES[r.type].fields}
                    dynamicOptions={dynamicOptions}
                    initialValues={r.values}
                    submitLabel="Save changes"
                    onCancel={() => setEditingKey(null)}
                    onSubmit={(form) => handleSave(r, form)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
