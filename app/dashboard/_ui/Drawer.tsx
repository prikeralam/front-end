"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./icons";

/**
 * A panel that slides in from the right over the page, for creating and editing without losing the list. Built on
 * <dialog>, so focus is trapped, Escape closes it and the page behind is inert without extra code.
 */
export default function Drawer({ open, title, subtitle, onClose, children }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="drawer-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-none w-full max-w-[560px] bg-white p-0 shadow-[-12px_0_40px_rgba(23,26,43,0.14)] backdrop:bg-[#171a2b]/35 open:animate-[drawer-in_220ms_ease-out]"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-[#e3e6f0] px-6 py-4">
            <div className="min-w-0">
              <h2 id="drawer-title" className="font-[family-name:var(--font-heading)] text-[19px] text-[#171a2b]">{title}</h2>
              {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-[#7d86a8]">{subtitle}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-[#6f7899] hover:bg-[#f3f5fa] hover:text-[#171a2b]">
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
