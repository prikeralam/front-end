"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, canContributeContent, canReviewDrafts, type MockSession } from "../../_lib/mockAuth";
import { createDraft, type WorkflowRecord } from "../../_lib/mockContentStore";
import type { Person } from "../../_lib/types";
import { PageHeader } from "../../_ui/kit";
import SimpleDraftForm from "../_ui/SimpleDraftForm";
import ContentWorkflowPanel from "../_ui/ContentWorkflowPanel";

const GROUPS = ["team", "patron", "advisory", "executive", "fellow", "past-fellow", "author"];

export default function ManageTeam() {
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
        kicker="Team & People · Module A"
        title="People directory"
        intro="Draft entries for Team, Patrons, Advisory Body, Executive Council, Fellows, and Authors — one shared profile shape across every group."
      />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContributeContent(session) && !canReviewDrafts(session) ? (
          <p className="text-sm text-[#8b8fa3]">Content drafting is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm
                title="New person profile"
                fields={[
                  { key: "name", label: "Name", kind: "text" },
                  { key: "role", label: "Role / title", kind: "text" },
                  { key: "group", label: "Group", kind: "select", options: GROUPS },
                  { key: "bio", label: "Bio", kind: "textarea" },
                ]}
                note="Mock draft — doesn't change any live page yet; demos the review workflow only."
                onSubmit={(values) => {
                  const data: Person = {
                    slug: `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
                    name: values.name,
                    role: values.role,
                    group: values.group as Person["group"],
                    bio: values.bio,
                    status: "placeholder",
                    photo: null,
                  };
                  createDraft("person-profile", data, session);
                  bump();
                }}
              />
            )}
            <div className="mt-12">
              <ContentWorkflowPanel
                contentType="person-profile"
                session={session}
                bump={bump}
                renderSummary={(r: WorkflowRecord) => {
                  const d = r.data as Person;
                  return (
                    <>
                      <p className="text-[15px] font-semibold text-[#171a2b]">{d.name}</p>
                      <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.role} &middot; {d.group}</p>
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
