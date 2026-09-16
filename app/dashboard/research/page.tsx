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

  const fields = [
    { key: "title", label: "Title", kind: "text" as const },
    { key: "abstract", label: "Abstract", kind: "textarea" as const },
    { key: "format", label: "Format", kind: "select" as const, options: publicationFormats },
    { key: "theme", label: "Theme", kind: "select" as const, options: publicationThemes },
    { key: "language", label: "Language", kind: "select" as const, options: publicationLanguages },
    { key: "authorSlug", label: "Primary author (Person slug)", kind: "text" as const },
  ];
  function buildData(values: Record<string, string>, existing?: Publication): Publication {
    return {
      slug: existing?.slug ?? `${values.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      title: values.title,
      abstract: values.abstract,
      format: values.format as Publication["format"],
      theme: values.theme,
      date: existing?.date ?? new Date().toISOString().slice(0, 10),
      authors: values.authorSlug ? [values.authorSlug] : [],
      language: values.language as Publication["language"],
      views: existing?.views ?? 0,
      status: existing?.status ?? "placeholder",
      cover: existing?.cover ?? null,
    };
  }
  function toFormValues(data: Publication): Record<string, string> {
    return {
      title: data.title,
      abstract: data.abstract,
      format: data.format,
      theme: data.theme,
      language: data.language,
      authorSlug: data.authors[0] ?? "",
    };
  }

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
                fields={fields}
                note="Mock draft — demos the Draft→Review→Approve→Publish workflow only; full publication-repository features (versioning, DOI, citation export) belong to a separate, future-phase module."
                onSubmit={(values) => {
                  createDraft("publication", buildData(values), session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="publication"
                session={session}
                bump={bump}
                fields={fields}
                toFormValues={toFormValues}
                buildData={buildData}
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
