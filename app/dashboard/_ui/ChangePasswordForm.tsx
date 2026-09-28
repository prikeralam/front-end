"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { changeOwnPasswordAction, type PasswordResult } from "../../_lib/auth/passwordActions";
import { signOut } from "../../_lib/auth/authClient";
import PasswordInput from "../../_ui/PasswordInput";

/**
 * Shown instead of the dashboard while the account still has the temporary password an admin set. The backend clears
 * `must_change_password` when the change succeeds; `onChanged` re-checks the session.
 */
export default function ChangePasswordForm({ name, onChanged }: { name: string; onChanged: () => void }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!current || !next) return setError("Fill in all three fields.");
    if (next !== confirm) return setError("The new passwords don't match.");
    if (next === current) return setError("Choose a password different from the temporary one.");
    setBusy(true);
    setError("");
    const result = await changeOwnPasswordAction(current, next).catch((): PasswordResult => ({ ok: false, message: "We couldn't reach the server. Please try again." }));
    setBusy(false);
    if (result.ok) onChanged();
    else setError(result.message);
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <form onSubmit={submit} noValidate className="rounded-xl border border-[#e6e8f0] bg-white p-6 shadow-[0_2px_16px_rgba(15,107,92,0.06)] sm:p-8" aria-busy={busy}>
        <p className="text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">One more step</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#171a2b]">Choose your own password</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#5b5f74]">
          Welcome, {name}. Your account was set up with a temporary password. Replace it with one only you know to continue to the dashboard.
        </p>

        <div id="change-error" role="alert" className={error ? "mt-5 rounded-lg border border-[#E4633F]/30 bg-[#E4633F]/8 p-3 text-[13px] text-[#5b5f74]" : "sr-only"}>
          {error}
        </div>

        <div className="mt-6 space-y-5">
          <PasswordInput id="current-password" label="Temporary password" value={current} onChange={setCurrent} autoComplete="current-password" autoFocus describedBy={error ? "change-error" : undefined} />
          <PasswordInput id="new-password" label="New password" value={next} onChange={setNext} autoComplete="new-password" describedBy={error ? "change-error" : undefined} />
          <PasswordInput id="confirm-password" label="Repeat new password" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={!!confirm && confirm !== next} describedBy={error ? "change-error" : undefined} />
        </div>

        <button type="submit" disabled={busy} className="mt-7 flex h-11 w-full items-center justify-center rounded-full bg-[#253D9A] text-sm font-semibold text-white transition-colors hover:bg-[#1B2C70] disabled:cursor-not-allowed disabled:opacity-70">
          {busy ? "Saving…" : "Save password and continue"}
        </button>
        <button type="button" onClick={() => signOut().then(() => router.replace("/account"))} className="mt-4 w-full text-center text-[13px] font-semibold text-[#8b8fa3] hover:text-[#171a2b]">
          Sign out instead
        </button>
      </form>
    </section>
  );
}
