"use client";

import type { ReactNode } from "react";
import {
  listRecords,
  transition,
  workflowStatusLabel,
  type ContentTypeKey,
  type WorkflowRecord,
  type WorkflowStatus,
} from "../../_lib/mockContentStore";
import { canContributeContent, canReviewDrafts, type MockSession } from "../../_lib/mockAuth";
import { SectionHeading, EmptyState } from "../../_ui/kit";

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
}: {
  contentType: K;
  session: MockSession;
  renderSummary: (record: WorkflowRecord) => ReactNode;
  bump: () => void;
}) {
  const all = listRecords(contentType);
  const mine = all.filter((r) => r.submittedByEmail === session.email);
  const canReview = canReviewDrafts(session);
  const canSubmit = canContributeContent(session);
  const awaitingReview = canReview ? all.filter((r) => r.workflowStatus !== "draft") : [];

  function handleTransition(id: string, next: WorkflowStatus) {
    const result = transition(contentType, id, next, session);
    if (!result.ok) {
      window.alert(result.reason);
      return;
    }
    bump();
  }

  return (
    <div className="space-y-12">
      {mine.length > 0 && (
        <div>
          <SectionHeading>Your submissions</SectionHeading>
          <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
            {mine.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">{renderSummary(r)}</div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.workflowStatus === "draft" && canSubmit && (
                    <button
                      onClick={() => handleTransition(r.id, "in_review")}
                      className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                    >
                      Submit for review
                    </button>
                  )}
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[r.workflowStatus]}`}>
                    {workflowStatusLabel[r.workflowStatus]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canReview && (
        <div className={mine.length > 0 ? "border-t border-[#e6e8f0] pt-10" : undefined}>
          <SectionHeading>Awaiting review or already live</SectionHeading>
          {awaitingReview.length === 0 ? (
            <div className="mt-6"><EmptyState message="Nothing to review right now." /></div>
          ) : (
            <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {awaitingReview.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    {renderSummary(r)}
                    <p className="mt-1 text-[12px] text-[#8b8fa3]">submitted by {r.submittedByName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {nextActions(r.workflowStatus).map((a) => (
                      <button
                        key={a.label}
                        onClick={() => handleTransition(r.id, a.next)}
                        className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                      >
                        {a.label}
                      </button>
                    ))}
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[r.workflowStatus]}`}>
                      {workflowStatusLabel[r.workflowStatus]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mine.length === 0 && !canReview && (
        <EmptyState message="Nothing submitted yet — use the form above to create a draft." />
      )}
    </div>
  );
}
