"use client";

import { useCallback, useEffect, useState } from "react";
import { createCmsAction, getFormOptionsAction, listCmsAction, type FormOptions } from "../../_lib/dashboard/cmsActions";
import { RESOURCES } from "../../_lib/cms/resources";
import { contentTypeLabel, type CmsListResult, type CmsMutation, type ContentTypeKey } from "../../_lib/cms/types";
import { canContributeContent, canReviewDrafts } from "../../_lib/session";
import { useRequireSession } from "../../_lib/useSession";
import { PageHeader } from "../../_ui/kit";
import ContentWorkflowPanel from "./ContentWorkflowPanel";
import SimpleDraftForm from "./SimpleDraftForm";

/**
 * One CMS screen: a create form and the workflow list for a content type, all backed by the API. The eight dashboard
 * pages are just configurations of this component.
 */
export default function CmsScreen({ type, kicker, title, intro, createTitle, note }: { type: ContentTypeKey; kicker: string; title: string; intro: string; createTitle?: string; note?: string }) {
  const session = useRequireSession();
  const [list, setList] = useState<CmsListResult | "loading">("loading");
  const [options, setOptions] = useState<FormOptions | undefined>(undefined);
  const resource = RESOURCES[type];
  const needsOptions = resource.fields.some((f) => f.optionsFrom);

  const reload = useCallback(() => {
    listCmsAction(type)
      .then(setList)
      .catch(() => setList({ status: "error" }));
  }, [type]);

  const allowed = !!session && (canContributeContent(session) || canReviewDrafts(session));

  useEffect(() => {
    if (!allowed) return;
    reload();
    if (needsOptions) getFormOptionsAction().then(setOptions).catch(() => setOptions(undefined));
  }, [allowed, reload, needsOptions]);

  if (!session) return null;

  async function handleCreate(form: FormData): Promise<CmsMutation> {
    const result = await createCmsAction(type, form);
    if (result.ok) reload();
    return result;
  }

  return (
    <>
      <PageHeader kicker={kicker} title={title} intro={intro} />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!allowed ? (
          <p className="text-sm text-[#8b8fa3]">Editing is limited to Researcher, Editor, and Admin roles.</p>
        ) : (
          <>
            {canContributeContent(session) && (
              <SimpleDraftForm title={createTitle ?? `New ${contentTypeLabel[type].toLowerCase()}`} fields={resource.fields} dynamicOptions={options} note={note} onSubmit={handleCreate} />
            )}
            <div className="mt-12">
              {list === "loading" ? (
                <p role="status" className="text-sm text-[#8b8fa3]">Loading…</p>
              ) : list.status === "ok" ? (
                <ContentWorkflowPanel records={list.records} session={session} dynamicOptions={options} onChanged={reload} />
              ) : list.status === "signed-out" ? (
                <p className="text-sm text-[#8b8fa3]">Your session has ended. <a href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in again</a>.</p>
              ) : list.status === "forbidden" ? (
                <p className="text-sm text-[#8b8fa3]">The server says this account may not view these items.</p>
              ) : (
                <p className="text-sm text-[#E4633F]">We couldn&apos;t load these items just now. Please refresh and try again.</p>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
