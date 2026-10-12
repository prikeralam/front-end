"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { IMAGE_ACCEPT } from "../../_lib/cms/resources";
import { addEventPhotoAction, listEventPhotosAction, removeEventPhotoAction, type EventPhotosResult } from "../../_lib/dashboard/eventActions";
import { secondaryButton } from "./DashboardPageHeader";

const MAX_PHOTOS = 20;
const unreachable = { ok: false as const, message: "We couldn't reach the server. Please try again." };
const fieldLabel = "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f7899]";

/**
 * A saved event's photo gallery, shown on its public page below the programme. The cover image (in the form above)
 * stays the one on cards. Photos are added one at a time, each with an optional caption.
 */
export default function EventPhotosPanel({ slug, onChanged }: { slug: string; onChanged: () => void }) {
  const [state, setState] = useState<EventPhotosResult | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const reload = useCallback(() => {
    listEventPhotosAction(slug)
      .then(setState)
      .catch(() => setState({ status: "error" }));
  }, [slug]);

  useEffect(() => {
    let current = true;
    listEventPhotosAction(slug)
      .then((next) => current && setState(next))
      .catch(() => current && setState({ status: "error" }));
    return () => {
      current = false;
    };
  }, [slug]);

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await addEventPhotoAction(slug, new FormData(e.currentTarget)).catch(() => unreachable);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    formRef.current?.reset();
    reload();
    onChanged();
  }

  async function remove(id: number) {
    setBusy(true);
    setError("");
    const result = await removeEventPhotoAction(slug, id).catch(() => unreachable);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    reload();
    onChanged();
  }

  return (
    <section className="mt-8 border-t border-[#e3e6f0] pt-6">
      <h3 className="text-[16px] font-semibold text-[#171a2b]">Photos</h3>
      <p className="mb-4 mt-1 text-[13px] leading-relaxed text-[#5b6280]">
        A gallery on the event&apos;s page, in the order added. Up to {MAX_PHOTOS}. The cover image above stays the one on cards.
      </p>

      {state === "loading" ? (
        <p className="text-[13px] text-[#8b8fa3]">Loading photos…</p>
      ) : state.status !== "ok" ? (
        <p className="text-[13px] text-[#B4432A]">{state.status === "signed-out" ? "Your session has ended. Please sign in again." : "We couldn't load this event's photos."}</p>
      ) : (
        <>
          {state.photos.length > 0 && (
            <ul className="grid grid-cols-3 gap-3">
              {state.photos.map((photo) => (
                <li key={photo.id} className="overflow-hidden rounded-md border border-[#e3e6f0] bg-white">
                  <div className="aspect-[4/3] bg-[#eef1f9]">
                    {/* Photos come from the storage bucket (presigned). */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={photo.caption} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-start justify-between gap-2 px-2 py-1.5">
                    <span className="min-w-0 truncate text-[12px] text-[#5b6280]" title={photo.caption}>{photo.caption || "No caption"}</span>
                    <button type="button" disabled={busy} onClick={() => remove(photo.id)} className="shrink-0 text-[12px] font-semibold text-[#B4432A] hover:underline disabled:opacity-50">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {state.photos.length < MAX_PHOTOS ? (
            <form ref={formRef} onSubmit={add} className="mt-4 grid gap-3 rounded-md border border-dashed border-[#d3d8e8] bg-[#fafbfd] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="min-w-0">
                <span className={fieldLabel}>Photo (JPG, PNG or WebP, up to 5 MB)</span>
                <input name="image" type="file" accept={IMAGE_ACCEPT} required className="block w-full text-[13px] file:mr-3 file:rounded file:border-0 file:bg-[#253D9A]/10 file:px-3 file:py-1.5 file:font-semibold file:text-[#253D9A]" />
              </label>
              <label className="min-w-0">
                <span className={fieldLabel}>Caption (optional)</span>
                <input name="caption" type="text" maxLength={200} className="h-10 w-full rounded-md border border-[#dcdee8] bg-white px-3 text-[14px]" />
              </label>
              <button type="submit" disabled={busy} className={secondaryButton}>
                {busy ? "Uploading…" : "Add photo"}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-[13px] text-[#5b6280]">This event has {MAX_PHOTOS} photos, the most it can have. Remove one to add another.</p>
          )}
        </>
      )}
      {error && <p role="alert" className="mt-2 text-[13px] text-[#B4432A]">{error}</p>}
    </section>
  );
}
