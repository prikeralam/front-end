"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { formatSize } from "../../data/_ui/DownloadFiles";
import { DATASET_FORMATS } from "../../_lib/datasetFormats";
import { addExtraFormatAction, listExtraFormatsAction, removeExtraFormatAction, type ExtraFormatsResult } from "../../_lib/dashboard/datasetActions";
import { secondaryButton } from "./DashboardPageHeader";

const label = "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f7899]";
const unreachable = { ok: false as const, message: "We couldn't reach the server. Please try again." };

/**
 * A saved dataset's other formats: the same data as CSV, JSON, Parquet and so on, offered as extra downloads on the
 * public page. The main file (edited in the form above) stays the one previews and row counts come from.
 */
export default function DatasetFormatsPanel({ slug }: { slug: string }) {
  const [state, setState] = useState<ExtraFormatsResult | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const reload = useCallback(() => {
    listExtraFormatsAction(slug)
      .then(setState)
      .catch(() => setState({ status: "error" }));
  }, [slug]);

  useEffect(() => {
    let current = true;
    listExtraFormatsAction(slug)
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
    const result = await addExtraFormatAction(slug, new FormData(e.currentTarget)).catch(() => unreachable);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    formRef.current?.reset();
    reload();
  }

  async function remove(id: number) {
    setBusy(true);
    setError("");
    const result = await removeExtraFormatAction(slug, id).catch(() => unreachable);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    reload();
  }

  if (state === "loading") return <Section><p className="text-[13px] text-[#8b8fa3]">Loading formats…</p></Section>;
  if (state.status !== "ok") {
    return (
      <Section>
        <p className="text-[13px] text-[#B4432A]">{state.status === "signed-out" ? "Your session has ended. Please sign in again." : "We couldn't load this dataset's formats."}</p>
      </Section>
    );
  }

  const taken = new Set([state.mainFormat, ...state.extras.map((e) => e.format)]);
  const available = DATASET_FORMATS.filter((f) => !taken.has(f.code));
  const mainLabel = DATASET_FORMATS.find((f) => f.code === state.mainFormat)?.label ?? state.mainFormat;

  return (
    <Section>
      <ul className="divide-y divide-[#edf0f6] rounded-md border border-[#e3e6f0]">
        <li className="flex items-center justify-between gap-3 px-3 py-2.5 text-[14px]">
          <span className="font-semibold text-[#171a2b]">{mainLabel}</span>
          <span className="text-[12px] text-[#6f7899]">main file (replace it above)</span>
        </li>
        {state.extras.map((extra) => (
          <li key={extra.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[14px]">
            <span className="font-semibold text-[#171a2b]">
              {extra.label} <span className="ml-1 font-[family-name:var(--font-mono)] text-[12px] font-normal text-[#6f7899]">{formatSize(extra.size)}</span>
            </span>
            <button type="button" disabled={busy} onClick={() => remove(extra.id)} className="text-[13px] font-semibold text-[#B4432A] hover:underline disabled:opacity-50">
              Remove
            </button>
          </li>
        ))}
      </ul>

      {available.length > 0 && (
        <form ref={formRef} onSubmit={add} className="mt-4 grid gap-3 rounded-md border border-dashed border-[#d3d8e8] bg-[#fafbfd] p-3 sm:grid-cols-[150px_1fr_auto] sm:items-end">
          <label>
            <span className={label}>Format</span>
            <select name="format" required className="h-10 w-full rounded-md border border-[#dcdee8] bg-white px-2 text-[14px]">
              {available.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0">
            <span className={label}>File (up to 10 MB)</span>
            <input name="file" type="file" required className="block w-full text-[13px] file:mr-3 file:rounded file:border-0 file:bg-[#253D9A]/10 file:px-3 file:py-1.5 file:font-semibold file:text-[#253D9A]" />
          </label>
          <button type="submit" disabled={busy} className={secondaryButton}>
            {busy ? "Uploading…" : "Add format"}
          </button>
        </form>
      )}
      {error && <p role="alert" className="mt-2 text-[13px] text-[#B4432A]">{error}</p>}
    </Section>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-[#e3e6f0] pt-6">
      <h3 className="text-[16px] font-semibold text-[#171a2b]">Other formats</h3>
      <p className="mb-4 mt-1 text-[13px] leading-relaxed text-[#5b6280]">
        The same data in other formats, offered as extra downloads. Visitors get the same access to every format.
      </p>
      {children}
    </section>
  );
}
