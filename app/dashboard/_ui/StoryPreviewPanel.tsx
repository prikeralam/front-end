"use client";

import { useEffect, useRef, useState } from "react";
import StoryFrame from "../../research/_ui/StoryFrame";
import { getStoryPreviewAction, removeStoryAction, type StoryPreview } from "../../_lib/dashboard/storyActions";
import { secondaryButton } from "./DashboardPageHeader";
import { CloseIcon } from "./icons";

const unreachable: StoryPreview = { status: "error", message: "We couldn't reach the server. Please try again." };

/**
 * A saved publication's story file: whether one is attached, anything worth fixing before publishing, and a
 * full-width preview exactly as the public page will frame it (same sandbox), so drafts can be checked first.
 */
export default function StoryPreviewPanel({ slug, title, onChanged }: { slug: string; title: string; onChanged: () => void }) {
  const [state, setState] = useState<StoryPreview | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    let current = true;
    getStoryPreviewAction(slug)
      .then((next) => current && setState(next))
      .catch(() => current && setState(unreachable));
    return () => {
      current = false;
    };
  }, [slug]);

  function openPreview() {
    setPreviewing(true);
    dialog.current?.showModal();
  }

  async function remove() {
    setBusy(true);
    setError("");
    const result = await removeStoryAction(slug).catch(() => ({ ok: false as const, message: "We couldn't reach the server. Please try again." }));
    setBusy(false);
    if (!result.ok) return setError(result.message);
    setState({ status: "none" });
    onChanged();
  }

  return (
    <section className="mt-8 border-t border-[#e3e6f0] pt-6">
      <h3 className="text-[16px] font-semibold text-[#171a2b]">Story file</h3>
      {state === "loading" ? (
        <p className="mt-2 text-[13px] text-[#8b8fa3]">Checking for a story file…</p>
      ) : state.status === "none" ? (
        <p className="mt-1 text-[13px] leading-relaxed text-[#5b6280]">No story file is attached. The public page shows the abstract. Upload one in the form above.</p>
      ) : state.status === "error" ? (
        <p className="mt-2 text-[13px] text-[#B4432A]">{state.message}</p>
      ) : (
        <>
          <p className="mt-1 text-[13px] leading-relaxed text-[#5b6280]">
            A story file is attached and is shown on the public page under the title and abstract. Upload a new file above to replace it.
          </p>
          {state.warnings.length > 0 && (
            <ul className="mt-3 space-y-1.5 rounded-md border border-[#f0d9a8] bg-[#fdf8ec] px-3 py-2.5 text-[13px] leading-relaxed text-[#7a5a14]">
              {state.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={openPreview} className={secondaryButton}>
              Preview story
            </button>
            <button type="button" disabled={busy} onClick={remove} className="text-[13px] font-semibold text-[#B4432A] hover:underline disabled:opacity-50">
              {busy ? "Removing…" : "Remove story file"}
            </button>
          </div>
        </>
      )}
      {error && <p role="alert" className="mt-2 text-[13px] text-[#B4432A]">{error}</p>}

      <dialog
        ref={dialog}
        onClose={() => setPreviewing(false)}
        aria-label={`Preview: ${title}`}
        className="m-auto h-[92vh] max-h-none w-[min(860px,96vw)] max-w-none overflow-y-auto rounded-lg bg-white p-0 backdrop:bg-[#171a2b]/55"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#e3e6f0] bg-white/95 px-5 py-3 backdrop-blur">
          <p className="truncate text-[13px] text-[#5b6280]">
            <span className="font-semibold text-[#171a2b]">Preview</span> · {title}
          </p>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close preview" className="rounded-md p-1.5 text-[#6f7899] hover:bg-[#f3f5fa] hover:text-[#171a2b]">
            <CloseIcon />
          </button>
        </div>
        {previewing && typeof state === "object" && state.status === "ok" && (
          <div className="px-6 py-6">
            <StoryFrame html={state.html} title={title} />
          </div>
        )}
      </dialog>
    </section>
  );
}
