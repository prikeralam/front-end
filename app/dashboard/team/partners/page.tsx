"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, canContributeContent, canReviewDrafts, type MockSession } from "../../../_lib/mockAuth";
import { createDraft, type WorkflowRecord } from "../../../_lib/mockContentStore";
import type { Partner } from "../../../_lib/types";
import { PageHeader } from "../../../_ui/kit";
import SimpleDraftForm from "../../_ui/SimpleDraftForm";
import ContentWorkflowPanel from "../../_ui/ContentWorkflowPanel";

export default function ManagePartners() {
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
        kicker="Team & People · Partner & Consortium Network"
        title="Partners"
        intro="Draft institutional or individual-researcher partner entries and route them through review before they're listed publicly."
      />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContributeContent(session) && !canReviewDrafts(session) ? (
          <p className="text-sm text-[#8b8fa3]">Content drafting is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm
                title="New partner"
                fields={[
                  { key: "name", label: "Name", kind: "text" },
                  { key: "type", label: "Type", kind: "select", options: ["institution", "researcher"] },
                  { key: "description", label: "Description", kind: "textarea" },
                ]}
                note="Mock draft — doesn't change any live page yet; demos the review workflow only."
                onSubmit={(values) => {
                  const data: Partner = {
                    slug: `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
                    name: values.name,
                    description: values.description,
                    type: values.type as Partner["type"],
                    status: "placeholder",
                    logo: null,
                  };
                  createDraft("partner", data, session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="partner"
                session={session}
                bump={bump}
                renderSummary={(r: WorkflowRecord) => {
                  const d = r.data as Partner;
                  return (
                    <>
                      <p className="text-[15px] font-semibold text-[#171a2b]">{d.name}</p>
                      <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.type}</p>
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
