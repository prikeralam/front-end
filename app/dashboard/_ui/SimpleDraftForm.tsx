"use client";

import { useRef, useState, type FormEvent } from "react";
import type { CmsMutation, FieldConfig, FieldOption } from "../../_lib/cms/types";

const controlClass =
  "w-full rounded-lg border border-[#dcdee8] bg-white px-3 text-[14px] text-[#171a2b] outline-none focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 read-only:bg-[#fafbfc] read-only:text-[#8b8fa3]";

/**
 * A form for one CMS object. Inputs are uncontrolled and the whole form goes to the caller as `FormData` (which is how
 * a file reaches a Server Action), so there is no per-field state to keep in step. Errors from the server appear
 * inline; the form only resets after a successful create.
 */
export default function SimpleDraftForm({
  title,
  fields,
  dynamicOptions,
  note,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  title: string;
  fields: FieldConfig[];
  /** Options for fields that get them from the backend, keyed by `FieldConfig.optionsFrom`. */
  dynamicOptions?: Record<string, FieldOption[]>;
  note?: string;
  initialValues?: Record<string, string>;
  submitLabel?: string;
  onSubmit: (form: FormData) => Promise<CmsMutation>;
  onCancel?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!initialValues;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);

    const result = await onSubmit(new FormData(e.currentTarget)).catch((): CmsMutation => ({ ok: false, message: "We couldn't reach the server. Please try again." }));
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (!isEdit) formRef.current?.reset();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-[#e6e8f0] bg-white p-6" aria-busy={busy}>
      <h3 className="text-lg font-bold text-[#171a2b]">{title}</h3>
      {note && <p className="text-[13px] text-[#8b8fa3]">{note}</p>}

      {fields.map((f) => {
        const id = `${title}-${f.key}`.replace(/\s+/g, "-").toLowerCase();
        const required = !f.optional && !(f.kind === "file" && isEdit);
        const readOnly = isEdit && f.createOnly;
        const opts = f.options ?? (f.optionsFrom ? dynamicOptions?.[f.optionsFrom] : undefined) ?? [];
        const initial = initialValues?.[f.key];

        return (
          <div key={f.key}>
            <label htmlFor={id} className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">
              {f.label}
              {f.optional && <span className="ml-1 font-normal normal-case tracking-normal">(optional)</span>}
            </label>
            {f.kind === "textarea" ? (
              <textarea id={id} name={f.key} defaultValue={initial ?? ""} required={required} readOnly={readOnly} rows={3} className={`${controlClass} py-2`} />
            ) : f.kind === "select" ? (
              <select id={id} name={f.key} defaultValue={initial ?? ""} required={required} className={`${controlClass} h-10 px-2`}>
                {(f.optional || !initial) && <option value="">{f.optional ? "None" : "Choose…"}</option>}
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.kind === "file" ? (
              <input id={id} name={f.key} type="file" accept={f.accept} required={required} className="block w-full text-[13px] text-[#5b5f74] file:mr-3 file:rounded-full file:border-0 file:bg-[#253D9A]/10 file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[#253D9A]" />
            ) : (
              <input
                id={id}
                name={f.key}
                type={f.kind === "date" ? "date" : f.kind === "number" ? "number" : "text"}
                defaultValue={initial ?? ""}
                required={required}
                readOnly={readOnly}
                className={`${controlClass} h-10`}
              />
            )}
            {f.help && <p className="mt-1 text-[12px] text-[#8b8fa3]">{f.help}</p>}
          </div>
        );
      })}

      <div role="alert" className={error ? "rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] text-[#5b5f74]" : "sr-only"}>
        {error ?? ""}
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="rounded-full bg-[#253D9A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-70">
          {busy ? "Saving…" : (submitLabel ?? "Save as draft")}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-full border border-[#dcdee8] px-6 py-2.5 text-sm font-semibold text-[#5b5f74] hover:bg-[#f0f1f5]">
            Cancel
          </button>
        )}
        {saved && <span role="status" className="text-[13px] font-semibold text-[#253D9A]">Saved</span>}
      </div>
    </form>
  );
}
