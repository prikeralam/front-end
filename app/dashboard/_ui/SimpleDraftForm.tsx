"use client";

import { useState, type FormEvent } from "react";

export type FieldConfig = { key: string; label: string; kind: "text" | "textarea" | "select"; options?: string[] };

export default function SimpleDraftForm({
  title,
  fields,
  note,
  onSubmit,
}: {
  title: string;
  fields: FieldConfig[];
  note?: string;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.kind === "select" ? f.options?.[0] ?? "" : ""]));
  const [values, setValues] = useState<Record<string, string>>(blank);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
    setValues(blank());
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-[#e6e8f0] bg-white p-6">
      <h3 className="text-lg font-bold text-[#171a2b]">{title}</h3>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">{f.label}</label>
          {f.kind === "textarea" ? (
            <textarea
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              required
              rows={3}
              className="w-full rounded-lg border border-[#dcdee8] px-3 py-2 text-[14px]"
            />
          ) : f.kind === "select" ? (
            <select
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]"
            >
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              required
              className="h-10 w-full rounded-lg border border-[#dcdee8] px-3 text-[14px]"
            />
          )}
        </div>
      ))}
      <button type="submit" className="rounded-full bg-[#253D9A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
        Save as draft
      </button>
      {submitted && <p className="text-[13px] font-semibold text-[#253D9A]">Saved as a draft — use &ldquo;Submit for review&rdquo; below when ready.</p>}
      {note && <p className="text-[11px] text-[#8b8fa3]">{note}</p>}
    </form>
  );
}
