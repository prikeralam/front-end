"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, canContributeContent, canReviewDrafts, type MockSession } from "../../_lib/mockAuth";
import { createDraft, type WorkflowRecord } from "../../_lib/mockContentStore";
import type { HeroProject } from "../../_content/projects";
import { PageHeader } from "../../_ui/kit";
import SimpleDraftForm from "../_ui/SimpleDraftForm";
import ContentWorkflowPanel from "../_ui/ContentWorkflowPanel";

export default function ManageProjects() {
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
        kicker="Projects"
        title="Projects"
        intro="Draft the hero project banners shown on the homepage and the /projects index, and route them through review before they go live."
      />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContributeContent(session) && !canReviewDrafts(session) ? (
          <p className="text-sm text-[#8b8fa3]">Content drafting is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm
                title="New project"
                fields={[
                  { key: "slug", label: "Slug", kind: "text" },
                  { key: "title", label: "Title", kind: "text" },
                  { key: "blurb", label: "Blurb", kind: "textarea" },
                ]}
                note="Mock draft — doesn't change any live page yet; demos the review workflow only."
                onSubmit={(values) => {
                  const data: HeroProject = {
                    slug: values.slug,
                    title: values.title,
                    blurb: values.blurb,
                    status: "placeholder",
                    image: { label: `${values.title} photograph`, ratio: "3:2", kind: "photo" },
                  };
                  createDraft("project", data, session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="project"
                session={session}
                bump={bump}
                renderSummary={(r: WorkflowRecord) => {
                  const d = r.data as HeroProject;
                  return (
                    <>
                      <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                      <p className="mt-1 line-clamp-1 text-[12px] text-[#8b8fa3]">{d.blurb}</p>
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
