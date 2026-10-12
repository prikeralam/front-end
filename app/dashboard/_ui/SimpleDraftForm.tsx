"use client";

import { useRef, useState, type FormEvent } from "react";
import type { CmsMutation, FieldConfig, FieldOption } from "../../_lib/cms/types";
import { primaryButton, secondaryButton } from "./DashboardPageHeader";
import ImageField from "./ImageField";

const controlClass =
  "w-full rounded-lg border border-[#d9ddea] bg-white px-3 text-[14px] text-[#171a2b] outline-none transition-shadow focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/15 read-only:bg-[#f6f7fb] read-only:text-[#7d86a8]";

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
  /** Shown above the fields; omit inside a drawer, which has its own title. */
  title?: string;
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
  const idPrefix = (title ?? (isEdit ? "edit" : "new")).replace(/\s+/g, "-").toLowerCase();

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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" aria-busy={busy}>
      {title && <h3 className="font-[family-name:var(--font-heading)] text-lg text-[#171a2b]">{title}</h3>}
      {note && <p className="rounded-lg bg-[#253D9A]/5 px-3 py-2 text-[12.5px] text-[#4f5878]">{note}</p>}

      {fields.map((f) => {
        const id = `${idPrefix}-${f.key}`;
        const required = !f.optional && !(f.kind === "file" && isEdit);
        const readOnly = isEdit && f.createOnly;
        const opts = f.options ?? (f.optionsFrom ? dynamicOptions?.[f.optionsFrom] : undefined) ?? [];
        const initial = initialValues?.[f.key];

        return (
          <div key={f.key}>
            <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-semibold text-[#3a4263]">
              {f.label}
              {f.optional && <span className="ml-1.5 font-normal text-[#8b93b3]">Optional</span>}
            </label>
            {f.kind === "image" ? (
              <ImageField field={f} id={id} uploadedUrl={initial || undefined} linkUrl={f.urlKey ? initialValues?.[f.urlKey] || undefined : undefined} />
            ) : f.kind === "lines" ? (
              <textarea id={id} name={f.key} defaultValue={initial ?? ""} required={required} readOnly={readOnly} rows={5} className={`${controlClass} py-2 leading-relaxed`} />
            ) : f.kind === "textarea" ? (
              <textarea id={id} name={f.key} defaultValue={initial ?? ""} required={required} readOnly={readOnly} rows={f.rows ?? 4} className={`${controlClass} py-2 leading-relaxed`} />
            ) : f.kind === "multiselect" ? (
              opts.length === 0 ? (
                <p id={id} className="rounded-lg border border-dashed border-[#d3d8e8] px-3 py-3 text-[13px] text-[#7d86a8]">
                  Nothing to choose from yet.
                </p>
              ) : (
                <fieldset id={id} className="max-h-56 overflow-y-auto rounded-lg border border-[#d9ddea] bg-white p-1">
                  <legend className="sr-only">{f.label}</legend>
                  {opts.map((o) => {
                    const checked = (initial ?? "").split(",").map((v) => v.trim()).includes(o.value);
                    return (
                      <label key={o.value} className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] text-[#171a2b] hover:bg-[#f3f5fa]">
                        <input type="checkbox" name={f.key} value={o.value} defaultChecked={checked} className="mt-0.5 h-4 w-4 shrink-0 accent-[#253D9A]" />
                        <span>{o.label}</span>
                      </label>
                    );
                  })}
                </fieldset>
              )
            ) : f.kind === "select" ? (
              <select id={id} name={f.key} defaultValue={initial ?? ""} required={required} className={`${controlClass} h-10 px-2`}>
                {(f.optional || !initial) && <option value="">{f.optional ? "None" : "Choose…"}</option>}
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : f.kind === "file" ? (
              <input
                id={id}
                name={f.key}
                type="file"
                accept={f.accept}
                required={required}
                className="block w-full rounded-lg border border-dashed border-[#d3d8e8] bg-[#fafbfd] p-3 text-[13px] text-[#5b6280] file:mr-3 file:rounded-lg file:border file:border-[#d9ddea] file:bg-white file:px-3 file:py-1.5 file:text-[12.5px] file:font-semibold file:text-[#253D9A]"
              />
            ) : (
              <input
                id={id}
                name={f.key}
                type={f.kind === "date" ? "date" : f.kind === "time" ? "time" : f.kind === "number" ? "number" : "text"}
                defaultValue={initial ?? ""}
                required={required}
                readOnly={readOnly}
                className={`${controlClass} h-10`}
              />
            )}
            {f.help && <p className="mt-1.5 text-[12px] text-[#7d86a8]">{f.help}</p>}
          </div>
        );
      })}

      <div role="alert" className={error ? "rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 px-3 py-2.5 text-[13px] text-[#8a3a22]" : "sr-only"}>
        {error ?? ""}
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-5 flex items-center gap-3 border-t border-[#e3e6f0] bg-white px-6 py-4">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? "Saving…" : (submitLabel ?? "Save as draft")}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
        {saved && <span role="status" className="text-[13px] font-semibold text-[#1f7a4d]">Saved</span>}
      </div>
    </form>
  );
}
