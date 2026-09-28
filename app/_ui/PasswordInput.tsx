"use client";

import { useState } from "react";

const inputClass =
  "h-11 w-full rounded-lg border border-[#dcdee8] bg-white px-3 pr-16 text-[15px] text-[#171a2b] outline-none transition-colors focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/20 aria-[invalid=true]:border-[#E4633F]";

/** A password field with a show/hide toggle, styled like the sign-in form. */
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  invalid,
  describedBy,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={128}
          required
          autoFocus={autoFocus}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          aria-label={`Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 rounded-r-lg px-3 text-[12px] font-semibold text-[#253D9A] hover:text-[#1B2C70] focus-visible:outline-2 focus-visible:outline-[#253D9A]"
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
