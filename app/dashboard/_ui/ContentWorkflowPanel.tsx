"use client";

import { useState, type ReactNode } from "react";
import {
  listRecords,
  updateDraft,
  deleteDraft,
  transition,
  workflowStatusLabel,
  type ContentDataFor,
  type ContentTypeKey,
  type WorkflowRecord,
  type WorkflowStatus,
} from "../../_lib/mockContentStore";
import { canContributeContent, canReviewDrafts, type MockSession } from "../../_lib/mockAuth";
import { SectionHeading, EmptyState } from "../../_ui/kit";
import SimpleDraftForm, { type FieldConfig } from "./SimpleDraftForm";

const statusColor: Record<WorkflowStatus, string> = {
  draft: "bg-[#8b8fa3]/10 text-[#5b5f74]",
  in_review: "bg-[#E4633F]/10 text-[#E4633F]",
  approved: "bg-[#C9972C]/10 text-[#C9972C]",
  published: "bg-[#253D9A]/10 text-[#253D9A]",
  unpublished: "bg-[#8b8fa3]/10 text-[#5b5f74]",
};

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

export default function ContentWorkflowPanel<K extends ContentTypeKey>({
  contentType,
  session,
  renderSummary,
  bump,
  fields,
  toFormValues,
  buildData,
}: {
  contentType: K;
  session: MockSession;
  renderSummary: (record: WorkflowRecord) => ReactNode;
  bump: () => void;
  fields: FieldConfig[];
  toFormValues: (data: ContentDataFor<K>) => Record<string, string>;
  buildData: (values: Record<string, string>, existing?: ContentDataFor<K>) => ContentDataFor<K>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const canReview = canReviewDrafts(session);
  const canSubmit = canContributeContent(session);
  const all = [...listRecords(contentType)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  function canEdit(r: WorkflowRecord<ContentDataFor<K>>) {
    return (r.submittedByEmail === session.email && canSubmit) || canReview;
  }

  function handleTransition(id: string, next: WorkflowStatus) {
    const result = transition(contentType, id, next, session);
    if (!result.ok) {
      window.alert(result.reason);
      return;
    }
    bump();
  }

  function handleSaveEdit(r: WorkflowRecord<ContentDataFor<K>>, values: Record<string, string>) {
    updateDraft(contentType, r.id, buildData(values, r.data));
    setEditingId(null);
    bump();
  }

  function handleDelete(r: WorkflowRecord<ContentDataFor<K>>) {
    if (!window.confirm("Delete this item? This can't be undone.")) return;
    deleteDraft(contentType, r.id);
    bump();
  }

  if (all.length === 0) {
    return <EmptyState message="Nothing here yet — use the form above to create one." />;
  }

  return (
    <div>
      <SectionHeading>All items</SectionHeading>
      <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
        {all.map((r) => {
          const editable = canEdit(r);
          const canSubmitThisDraft = r.workflowStatus === "draft" && r.submittedByEmail === session.email && canSubmit;
          return (
            <li key={r.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  {renderSummary(r)}
                  <p className="mt-1 text-[12px] text-[#8b8fa3]">submitted by {r.submittedByName}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {canSubmitThisDraft && (
                    <button
                      onClick={() => handleTransition(r.id, "in_review")}
                      className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                    >
                      Submit for review
                    </button>
                  )}
                  {canReview &&
                    nextActions(r.workflowStatus).map((a) => (
                      <button
                        key={a.label}
                        onClick={() => handleTransition(r.id, a.next)}
                        className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                      >
                        {a.label}
                      </button>
                    ))}
                  {editable && (
                    <button
                      onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                      className="rounded-full border border-[#dcdee8] px-3 py-1.5 text-[12px] font-semibold text-[#5b5f74] hover:bg-[#f0f1f5]"
                    >
                      {editingId === r.id ? "Close" : "Edit"}
                    </button>
                  )}
                  {editable && (
                    <button
                      onClick={() => handleDelete(r)}
                      className="rounded-full border border-[#E4633F]/40 px-3 py-1.5 text-[12px] font-semibold text-[#E4633F] hover:bg-[#E4633F]/10"
                    >
                      Delete
                    </button>
                  )}
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[r.workflowStatus]}`}>
                    {workflowStatusLabel[r.workflowStatus]}
                  </span>
                </div>
              </div>
              {editingId === r.id && (
                <div className="mt-4">
                  <SimpleDraftForm
                    title="Edit"
                    fields={fields}
                    initialValues={toFormValues(r.data)}
                    submitLabel="Save changes"
                    onCancel={() => setEditingId(null)}
                    onSubmit={(values) => handleSaveEdit(r, values)}
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
