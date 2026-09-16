"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, canContributeContent, canReviewDrafts, type MockSession } from "../../_lib/mockAuth";
import { createDraft, type WorkflowRecord } from "../../_lib/mockContentStore";
import type { ContentBlock } from "../../_lib/types";
import { PageHeader } from "../../_ui/kit";
import SimpleDraftForm from "../_ui/SimpleDraftForm";
import ContentWorkflowPanel from "../_ui/ContentWorkflowPanel";

export default function ManageContentBlocks() {
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
        title="Pages & content blocks"
        intro="Draft slug-addressable rich-text sections (e.g. About page copy) and route them through Draft → Review → Approve → Publish."
      />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContributeContent(session) && !canReviewDrafts(session) ? (
          <p className="text-sm text-[#8b8fa3]">Content drafting is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm
                title="New content block"
                fields={[
                  { key: "slug", label: "Slug", kind: "text" },
                  { key: "title", label: "Title", kind: "text" },
                  { key: "body", label: "Body", kind: "textarea" },
                ]}
                note="Mock draft — doesn't change any live page yet; demos the review workflow only."
                onSubmit={(values) => {
                  const data: ContentBlock = {
                    slug: values.slug,
                    title: values.title,
                    body: values.body,
                    updatedAt: new Date().toISOString(),
                  };
                  createDraft("content-block", data, session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="content-block"
                session={session}
                bump={bump}
                renderSummary={(r: WorkflowRecord) => {
                  const d = r.data as ContentBlock;
                  return (
                    <>
                      <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                      <p className="mt-1 text-[12px] text-[#8b8fa3]">/{d.slug}</p>
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
