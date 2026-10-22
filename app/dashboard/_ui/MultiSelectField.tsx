"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldOption } from "../../_lib/cms/types";
import { optionMatches } from "../../_lib/cms/optionSearch";

/**
 * Checkboxes for a multiselect field, with a search box once the list is long. Filtering only hides options, so every
 * checkbox stays in the form and ticked ones are submitted even when the search hides them.
 */
export default function MultiSelectField({ id, name, label, options, initial }: { id: string; name: string; label: string; options: FieldOption[]; initial: string }) {
  const ticked = initial.split(",").map((v) => v.trim()).filter(Boolean);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(ticked.length);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const searchable = options.length > 8;
  const shown = options.filter((o) => optionMatches(o, query)).length;

  // The checkboxes are uncontrolled (the form reads them as FormData and resets them after a create); count from the DOM.
  const recount = () => setCount(fieldsetRef.current?.querySelectorAll("input:checked").length ?? 0);
  useEffect(() => {
    const form = fieldsetRef.current?.form;
    const onReset = () => setTimeout(recount, 0);
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, []);

  return (
    <div className="grid gap-2">
      {searchable && (
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            placeholder="Search by title or catalog ID"
            aria-label={`Search ${label.toLowerCase()}`}
            aria-controls={id}
            className="h-9 w-full rounded-lg border border-[#d9ddea] bg-white px-3 text-[13.5px] text-[#171a2b] outline-none transition-shadow placeholder:text-[#8b93b3] focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/15"
          />
          <span className="shrink-0 font-[family-name:var(--font-mono)] text-[11.5px] text-[#6f7899]" aria-live="polite">
            {count} selected
          </span>
        </div>
      )}
      <fieldset ref={fieldsetRef} id={id} onChange={recount} className="max-h-72 overflow-y-auto rounded-lg border border-[#d9ddea] bg-white p-1">
        <legend className="sr-only">{label}</legend>
        {options.map((o) => (
          <label
            key={o.value}
            className={`${optionMatches(o, query) ? "flex" : "hidden"} cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] text-[#171a2b] hover:bg-[#f3f5fa]`}
          >
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={ticked.includes(o.value)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#253D9A]"
            />
            <span>{o.label}</span>
          </label>
        ))}
        {shown === 0 && <p className="px-2.5 py-2 text-[13px] text-[#7d86a8]">Nothing matches “{query.trim()}”.</p>}
      </fieldset>
    </div>
  );
}
