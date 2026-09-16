"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, canContributeContent, canReviewDrafts, type MockSession } from "../../../_lib/mockAuth";
import { createDraft, type WorkflowRecord } from "../../../_lib/mockContentStore";
import type { PRIDocument } from "../../../_lib/types";
import { PageHeader } from "../../../_ui/kit";
import SimpleDraftForm from "../../_ui/SimpleDraftForm";
import ContentWorkflowPanel from "../../_ui/ContentWorkflowPanel";

export default function ManageDocuments() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/account");
      return;
    }
    setSession(s);
  }, [router, tick]);

  if (!session) return null;
  const bump = () => setTick((t) => t + 1);

  return (
    <>
      <PageHeader
        kicker="Content · Module A"
        title="Documents"
        intro="Register annual reports, strategic plans, and other PDFs, and route them through review before they're linked publicly."
      />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContributeContent(session) && !canReviewDrafts(session) ? (
          <p className="text-sm text-[#8b8fa3]">Content drafting is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm
                title="New document"
                fields={[
                  { key: "title", label: "Title", kind: "text" },
                  { key: "kind", label: "Kind", kind: "select", options: ["Annual Report", "Strategic Plan", "Policy Brief", "Issue"] },
                  { key: "year", label: "Year", kind: "text" },
                ]}
                note="Mock draft — no real file upload happens yet; this demos the review workflow only."
                onSubmit={(values) => {
                  const data: PRIDocument = {
                    title: values.title,
                    kind: values.kind,
                    year: values.year,
                    status: "placeholder",
                  };
                  createDraft("document", data, session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="document"
                session={session}
                bump={bump}
                renderSummary={(r: WorkflowRecord) => {
                  const d = r.data as PRIDocument;
                  return (
                    <>
                      <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                      <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.kind} &middot; {d.year}</p>
                    </>
                  );
                }}
              />
            </div>
          </>
        )}
      </section>
    </>
  );
}
