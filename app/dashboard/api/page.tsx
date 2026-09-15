"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getOrCreateApiKey, regenerateApiKey, type MockSession } from "../../_lib/mockAuth";
import { PageHeader, SectionHeading } from "../../_ui/kit";
import DashboardTabs from "../_ui/DashboardTabs";

export default function ApiAccessV2() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [key, setKey] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/account");
      return;
    }
    setSession(s);
    setKey(getOrCreateApiKey(s.email));
  }, [router]);

  if (!session) return null;

  return (
    <>
      <PageHeader kicker="Your dashboard" title="API access" intro="A mock API key for scripted access to datasets you have permission to download." />
      <DashboardTabs />
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-xl border border-[#e6e8f0] bg-white p-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Your API key</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-[#fafbfc] px-4 py-2.5 font-mono text-[13px] text-[#171a2b]">{key}</code>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(key);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-full border border-[#253D9A] px-4 py-2 text-[13px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => setKey(regenerateApiKey(session.email))}
              className="rounded-full border border-[#8b8fa3]/40 px-4 py-2 text-[13px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
            >
              Regenerate
            </button>
          </div>
          <p className="mt-4 text-[12px] text-[#8b8fa3]">Mock key — no real API exists yet. Regenerating invalidates the previous key for this demo session.</p>
        </div>

        <div className="mt-10">
          <SectionHeading>Example usage</SectionHeading>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#12142b] p-5 text-[13px] leading-relaxed text-white/85">
{`curl https://api.priresearch.in/v1/datasets/sametham-enrolment/download \\
  -H "Authorization: Bearer ${key}"`}
          </pre>
          <p className="mt-3 text-[12px] text-[#8b8fa3]">This endpoint doesn't exist yet — it illustrates the intended shape once Module C's API is built.</p>
        </div>
      </section>
    </>
  );
}
