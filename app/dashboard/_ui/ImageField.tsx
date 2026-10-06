"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { IMAGE_ACCEPT } from "../../_lib/cms/resources";
import type { FieldConfig } from "../../_lib/cms/types";
import { ImageIcon, UploadIcon } from "./icons";

/**
 * An image upload with an instant preview, drag and drop, an optional link as the alternative, and removal of an
 * existing upload. Uncontrolled like the rest of the form: the file input, the link input and a hidden removal flag
 * (`<key>-remove`) all travel in the form's FormData.
 */
export default function ImageField({ field, id, uploadedUrl, linkUrl }: { field: FieldConfig; id: string; uploadedUrl?: string; linkUrl?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<{ name: string; preview: string } | null>(null);
  const [removed, setRemoved] = useState(false);
  const [link, setLink] = useState(linkUrl ?? "");
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (chosen) URL.revokeObjectURL(chosen.preview);
  }, [chosen]);

  function pick(file: File | undefined) {
    setChosen(file ? { name: file.name, preview: URL.createObjectURL(file) } : null);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !inputRef.current) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    pick(file);
  }

  function clear() {
    if (chosen) {
      if (inputRef.current) inputRef.current.value = "";
      setChosen(null);
    } else {
      setRemoved(true);
    }
  }

  const existing = removed ? "" : uploadedUrl;
  const shown = chosen?.preview || existing || link.trim();
  const source = chosen ? `New upload: ${chosen.name}` : existing ? "Uploaded image" : link.trim() ? "Linked image" : "No image yet";

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex items-center gap-4 rounded-xl border border-dashed p-3 transition-colors ${dragging ? "border-[#253D9A] bg-[#253D9A]/5" : "border-[#d3d8e8] bg-[#fafbfd]"}`}
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e3e6f0] bg-white">
          {shown ? (
            // Previews are blob: URLs or arbitrary links, which next/image cannot optimise.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon width={28} height={28} className="text-[#b3bad2]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#171a2b]">{source}</p>
          <p className="mt-0.5 text-[12px] text-[#7d86a8]">Drag an image here, or choose one. JPG, PNG or WebP, up to 5 MB.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d9ddea] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#253D9A] hover:bg-[#f3f5fa] focus-within:outline-2 focus-within:outline-[#253D9A]">
              <UploadIcon width={15} height={15} />
              {chosen || existing ? "Replace" : "Upload from computer"}
              <input ref={inputRef} id={id} name={field.key} type="file" accept={IMAGE_ACCEPT} onChange={(e) => pick(e.target.files?.[0])} className="sr-only" />
            </label>
            {(chosen || existing) && (
              <button type="button" onClick={clear} className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[#c2502f] hover:bg-[#E4633F]/10">
                {chosen ? "Discard" : "Remove"}
              </button>
            )}
            {removed && !chosen && (
              <button type="button" onClick={() => setRemoved(false)} className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[#5b6280] hover:bg-[#f3f5fa]">
                Undo
              </button>
            )}
          </div>
        </div>
      </div>
      {removed && !chosen && <input type="hidden" name={`${field.key}-remove`} value="1" />}

      {field.urlKey && (
        <details className="group mt-2" open={!!linkUrl}>
          <summary className="cursor-pointer list-none text-[12.5px] font-medium text-[#5b6280] hover:text-[#253D9A]">
            <span className="group-open:hidden">Or use an image link instead</span>
            <span className="hidden group-open:inline">Image link (used when nothing is uploaded)</span>
          </summary>
          <input
            name={field.urlKey}
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            aria-label={`${field.label} link`}
            className="mt-1.5 h-9 w-full rounded-lg border border-[#d9ddea] bg-white px-3 text-[13.5px] text-[#171a2b] outline-none focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/15"
          />
        </details>
      )}
    </div>
  );
}
