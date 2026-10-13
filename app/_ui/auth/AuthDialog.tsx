"use client";

import { useEffect, useRef } from "react";
import type { Session } from "../../_lib/session";
import AuthPanel, { type AuthTab } from "./AuthPanel";

/**
 * Sign in or create an account without leaving the page, e.g. from a dataset's Download button. A native `<dialog>`,
 * like the people pop-up: Escape and the backdrop close it, and focus returns to what opened it.
 */
export default function AuthDialog({ open, onClose, onSignedIn, next, title, initialTab = "signin" }: {
  open: boolean;
  onClose: () => void;
  onSignedIn: (session: Session) => void;
  next: string;
  title: string;
  initialTab?: AuthTab;
}) {
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
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="auth-dialog-title"
      className="m-auto max-h-[calc(100dvh-24px)] w-[min(440px,calc(100%-24px))] overflow-y-auto rounded-lg bg-white p-0 shadow-[0_24px_60px_-20px_rgba(15,18,32,0.5)] backdrop:bg-[#0f1220]/60"
    >
      {open && (
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id="auth-dialog-title" className="font-[family-name:var(--font-heading)] text-[22px] leading-snug text-[#171a2b]">{title}</h2>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#5b5f74]">Downloads are free; we ask for an account so we know who uses PRI&rsquo;s data.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md text-[#5b5f74] hover:bg-[#f2f3f8] hover:text-[#171a2b]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <AuthPanel next={next} initialTab={initialTab} onSignedIn={onSignedIn} />
        </div>
      )}
    </dialog>
  );
}
