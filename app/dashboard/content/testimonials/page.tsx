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

  const fields = [
    { key: "quote", label: "Quote", kind: "textarea" as const },
    { key: "name", label: "Attributed name", kind: "text" as const },
    { key: "role", label: "Role / affiliation", kind: "text" as const },
  ];
  function buildData(values: Record<string, string>, existing?: Testimonial): Testimonial {
    return {
      slug: existing?.slug ?? `testimonial-${Date.now()}`,
      quote: values.quote,
      name: values.name,
      role: values.role,
      status: existing?.status ?? "placeholder",
    };
  }
  function toFormValues(data: Testimonial): Record<string, string> {
    return { quote: data.quote, name: data.name, role: data.role };
  }

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
                fields={fields}
                note="Mock draft — doesn't change any live page yet; demos the review workflow only."
                onSubmit={(values) => {
                  createDraft("testimonial", buildData(values), session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="testimonial"
                session={session}
                bump={bump}
                fields={fields}
                toFormValues={toFormValues}
                buildData={buildData}
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
