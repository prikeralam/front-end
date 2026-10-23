import type { WorkflowStatus } from "../cms/types";

export type WorkflowStep = { label: string; next: WorkflowStatus };

/** What a reviewer can do next, forward step first. The backend checks the role again on every transition. */
export function reviewActions(status: WorkflowStatus): WorkflowStep[] {
  switch (status) {
    case "in_review":
      return [{ label: "Approve", next: "approved" }, { label: "Send back to draft", next: "draft" }];
    case "approved":
      return [{ label: "Publish", next: "published" }, { label: "Send back to draft", next: "draft" }];
    case "published":
      return [{ label: "Unpublish", next: "unpublished" }];
    case "unpublished":
      return [
        { label: "Republish", next: "published" },
        { label: "Send to review", next: "in_review" },
        { label: "Back to draft", next: "draft" },
      ];
    default:
      return [];
  }
}
