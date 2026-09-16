"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, canContributeContent, canReviewDrafts, type MockSession } from "../../../_lib/mockAuth";
import { createDraft, type WorkflowRecord } from "../../../_lib/mockContentStore";
import type { Testimonial } from "../../../_lib/types";
import { PageHeader } from "../../../_ui/kit";
import SimpleDraftForm from "../../_ui/SimpleDraftForm";
import ContentWorkflowPanel from "../../_ui/ContentWorkflowPanel";

export default function ManageTestimonials() {
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
        title="Testimonials"
        intro="Draft quotes for the site's testimonial strips and route them through review before they go live."
      />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContributeContent(session) && !canReviewDrafts(session) ? (
          <p className="text-sm text-[#8b8fa3]">Content drafting is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm
                title="New testimonial"
                fields={[
                  { key: "quote", label: "Quote", kind: "textarea" },
                  { key: "name", label: "Attributed name", kind: "text" },
                  { key: "role", label: "Role / affiliation", kind: "text" },
                ]}
                note="Mock draft — doesn't change any live page yet; demos the review workflow only."
                onSubmit={(values) => {
                  const data: Testimonial = {
                    slug: `testimonial-${Date.now()}`,
                    quote: values.quote,
                    name: values.name,
                    role: values.role,
                    status: "placeholder",
                  };
                  createDraft("testimonial", data, session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="testimonial"
                session={session}
                bump={bump}
                renderSummary={(r: WorkflowRecord) => {
                  const d = r.data as Testimonial;
                  return (
                    <>
                      <p className="line-clamp-1 text-[15px] font-semibold text-[#171a2b]">&ldquo;{d.quote}&rdquo;</p>
                      <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.name} &middot; {d.role}</p>
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
