"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { roles, roleLabels, setSession, type Role } from "../_lib/mockAuth";
import { PageHeader } from "../_ui/kit";

export default function AccountV2() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("public");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setSession({ name, email, role });
    router.push("/dashboard");
  }

  return (
    <>
      <PageHeader kicker="Register / Sign in" title="Access your data dashboard" />
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="mb-8 rounded-xl border border-[#E4633F]/30 bg-[#E4633F]/8 p-4 text-[13px] leading-relaxed text-[#5b5f74]">
          Demo sign-in — pick any role to preview that dashboard. No real account is created and nothing here is secure.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Full name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-[#dcdee8] bg-white px-3 text-[15px] text-[#171a2b]"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-[#dcdee8] bg-white px-3 text-[15px] text-[#171a2b]"
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8b8fa3]">Preview as</p>
            <div className="space-y-2">
              {roles.map((r) => (
                <label key={r} className="flex items-center gap-2 text-[15px] text-[#171a2b]">
                  <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} />
                  {roleLabels[r]}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="mt-2 rounded-full bg-[#253D9A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1B2C70]">
            Continue (demo — no real authentication)
          </button>
        </form>
      </section>
    </>
  );
}
