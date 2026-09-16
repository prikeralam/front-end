"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { publicationThemes, publicationFormats, publicationLanguages } from "../../_content/publications";
import { getSession, canContributeContent, canReviewDrafts, type MockSession } from "../../_lib/mockAuth";
import { createDraft, type WorkflowRecord } from "../../_lib/mockContentStore";
import type { Publication } from "../../_lib/types";
import { PageHeader } from "../../_ui/kit";
import SimpleDraftForm from "../_ui/SimpleDraftForm";
import ContentWorkflowPanel from "../_ui/ContentWorkflowPanel";

export default function ManageResearch() {
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
        kicker="Research & Publications · Module B"
        title="Publications"
        intro="Draft a publication and route it through Draft → Review → Approve → Publish before it appears on the Research & Publications hub."
      />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContributeContent(session) && !canReviewDrafts(session) ? (
          <p className="text-sm text-[#8b8fa3]">Publication drafting is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm
                title="New publication"
                fields={[
                  { key: "title", label: "Title", kind: "text" },
                  { key: "abstract", label: "Abstract", kind: "textarea" },
                  { key: "format", label: "Format", kind: "select", options: publicationFormats },
                  { key: "theme", label: "Theme", kind: "select", options: publicationThemes },
                  { key: "language", label: "Language", kind: "select", options: publicationLanguages },
                  { key: "authorSlug", label: "Primary author (Person slug)", kind: "text" },
                ]}
                note="Mock draft — demos the Draft→Review→Approve→Publish workflow only; full publication-repository features (versioning, DOI, citation export) belong to a separate, future-phase module."
                onSubmit={(values) => {
                  const data: Publication = {
                    slug: `${values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
                    title: values.title,
                    abstract: values.abstract,
                    format: values.format as Publication["format"],
                    theme: values.theme,
                    date: new Date().toISOString().slice(0, 10),
                    authors: values.authorSlug ? [values.authorSlug] : [],
                    language: values.language as Publication["language"],
                    views: 0,
                    status: "placeholder",
                    cover: null,
                  };
                  createDraft("publication", data, session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="publication"
                session={session}
                bump={bump}
                renderSummary={(r: WorkflowRecord) => {
                  const d = r.data as Publication;
                  return (
                    <>
                      <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                      <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.theme} &middot; {d.format} &middot; {d.language}</p>
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
