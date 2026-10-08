import type { ProjectStage } from "../_lib/types";

const STYLES: Record<ProjectStage, { label: string; className: string }> = {
  ongoing: { label: "Ongoing", className: "border-[#cdd6f3] bg-[#eef1fb] text-[#253D9A]" },
  completed: { label: "Completed", className: "border-[#d5e9dc] bg-[#eef7f1] text-[#2f6b45]" },
};

/** Whether a project is still running or finished, on project cards. */
export default function ProjectStageTag({ stage }: { stage: ProjectStage }) {
  const { label, className } = STYLES[stage];
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}>
      {label}
    </span>
  );
}
