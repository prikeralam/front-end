import { workflowStatusLabel, type WorkflowStatus } from "../../_lib/cms/types";

const tone: Record<WorkflowStatus, string> = {
  draft: "bg-[#eef0f5] text-[#4f5878] ring-[#d9ddea]",
  in_review: "bg-[#fdf3e3] text-[#9a6412] ring-[#f1dcb4]",
  approved: "bg-[#eaf0fd] text-[#253D9A] ring-[#cdd8f6]",
  published: "bg-[#e7f5ee] text-[#1f7a4d] ring-[#c3e6d3]",
  unpublished: "bg-[#f7ecea] text-[#9b3f2b] ring-[#ecd0ca]",
};

const dot: Record<WorkflowStatus, string> = {
  draft: "bg-[#8b93b3]",
  in_review: "bg-[#d98f1c]",
  approved: "bg-[#253D9A]",
  published: "bg-[#27a567]",
  unpublished: "bg-[#c2502f]",
};

export default function StatusBadge({ status }: { status: WorkflowStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${tone[status]}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {workflowStatusLabel[status]}
    </span>
  );
}
