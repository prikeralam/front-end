"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createCmsAction, getFormOptionsAction, listCmsAction, updateCmsAction, type FormOptions } from "../../_lib/dashboard/cmsActions";
import { RESOURCES } from "../../_lib/cms/resources";
import { WORKFLOW_STATUSES, contentTypeLabel, workflowStatusLabel, type CmsListResult, type CmsMutation, type CmsRecord, type ContentTypeKey, type WorkflowStatus } from "../../_lib/cms/types";
import { canContributeContent, canReviewDrafts } from "../../_lib/session";
import { useRequireSession } from "../../_lib/useSession";
import ContentWorkflowPanel from "./ContentWorkflowPanel";
import DashboardPageHeader, { primaryButton } from "./DashboardPageHeader";
import DatasetFormatsPanel from "./DatasetFormatsPanel";
import Drawer from "./Drawer";
import { ImageIcon, PlusIcon, SearchIcon } from "./icons";
import SimpleDraftForm from "./SimpleDraftForm";
import StoryPreviewPanel from "./StoryPreviewPanel";

type DrawerState = { mode: "create" } | { mode: "edit"; record: CmsRecord } | null;
type StatusFilter = WorkflowStatus | "all";

/**
 * One CMS screen: the list of what exists (search, status tabs), with "+ New" at the top right and create/edit in a
 * side drawer, all backed by the API. The eight dashboard pages are just configurations of this component.
 */
export default function CmsScreen({
  type,
  section,
  title,
  intro,
  newLabel,
  note,
  filterField,
}: {
  type: ContentTypeKey;
  /** The sidebar header this page sits under, for the breadcrumb. */
  section: string;
  title: string;
  intro: string;
  newLabel?: string;
  note?: string;
  /** A select field to offer as an extra list filter (e.g. a person's group). */
  filterField?: string;
}) {
  const session = useRequireSession();
  const [list, setList] = useState<CmsListResult | "loading">("loading");
  const [options, setOptions] = useState<FormOptions | undefined>(undefined);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState("");
  const resource = RESOURCES[type];
  const needsOptions = resource.fields.some((f) => f.optionsFrom);
  const showImages = resource.fields.some((f) => f.kind === "image");
  const facetField = filterField ? resource.fields.find((f) => f.key === filterField) : undefined;
  const label = contentTypeLabel[type].toLowerCase();

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

  const records = useMemo(() => (list !== "loading" && list.status === "ok" ? list.records : []), [list]);
  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(WORKFLOW_STATUSES.map((s) => [s, 0])) as Record<WorkflowStatus, number>;
    for (const r of records) byStatus[r.status] += 1;
    return byStatus;
  }, [records]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (!facetField || !facet || r.values[facetField.key] === facet) &&
        (!q || `${r.title} ${r.subtitle}`.toLowerCase().includes(q)),
    );
  }, [records, status, query, facet, facetField]);

  if (!session) return null;
  const canCreate = canContributeContent(session);
  // Always offer the main stages; approved/unpublished only appear when something is in them.
  const tabs: StatusFilter[] = ["all", "draft", "in_review", ...(counts.approved ? (["approved"] as const) : []), "published", ...(counts.unpublished ? (["unpublished"] as const) : [])];
  const missingImages = showImages ? records.filter((r) => !r.imageUrl).length : 0;

  async function handleCreate(form: FormData): Promise<CmsMutation> {
    const result = await createCmsAction(type, form);
    if (result.ok) {
      reload();
      setDrawer(null);
    }
    return result;
  }

  async function handleSave(record: CmsRecord, form: FormData): Promise<CmsMutation> {
    const result = await updateCmsAction(record.type, record.key, form);
    if (result.ok) {
      reload();
      setDrawer(null);
    }
    return result;
  }

  return (
    <>
      <DashboardPageHeader
        trail={[section, title]}
        title={title}
        description={intro}
        actions={
          allowed && canCreate ? (
            <button type="button" onClick={() => setDrawer({ mode: "create" })} className={primaryButton}>
              <PlusIcon width={16} height={16} /> {newLabel ?? `New ${label}`}
            </button>
          ) : undefined
        }
      />

      <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        {!allowed ? (
          <p className="text-sm text-[#7d86a8]">Editing is limited to Researcher, Editor, and Admin roles.</p>
        ) : list === "loading" ? (
          <div role="status" aria-label="Loading" className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/80" />
            ))}
          </div>
        ) : list.status === "signed-out" ? (
          <p className="text-sm text-[#7d86a8]">
            Your session has ended. <a href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in again</a>.
          </p>
        ) : list.status === "forbidden" ? (
          <p className="text-sm text-[#7d86a8]">The server says this account may not view these items.</p>
        ) : list.status === "error" ? (
          <p className="text-sm text-[#c2502f]">We couldn&apos;t load these items just now. Please refresh and try again.</p>
        ) : records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d3d8e8] bg-white px-6 py-14 text-center">
            <p className="font-[family-name:var(--font-heading)] text-[17px] text-[#171a2b]">No {label}s yet</p>
            <p className="mt-1 text-[13px] text-[#7d86a8]">{canCreate ? `Create the first one; it starts as a draft.` : "Nothing has been added here yet."}</p>
            {canCreate && (
              <button type="button" onClick={() => setDrawer({ mode: "create" })} className={`${primaryButton} mt-5`}>
                <PlusIcon width={16} height={16} /> {newLabel ?? `New ${label}`}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1 rounded-lg border border-[#e3e6f0] bg-white p-1">
                {tabs.map((t) => {
                  const count = t === "all" ? records.length : counts[t];
                  const selected = status === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setStatus(t)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${selected ? "bg-[#253D9A] text-white" : "text-[#4f5878] hover:bg-[#f3f5fa]"}`}
                    >
                      {t === "all" ? "All" : workflowStatusLabel[t]}
                      <span className={`rounded px-1.5 font-[family-name:var(--font-mono)] text-[11px] ${selected ? "bg-white/20" : "bg-[#eef0f5] text-[#6f7899]"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                {facetField && (
                  <select value={facet} onChange={(e) => setFacet(e.target.value)} aria-label={`Filter by ${facetField.label.toLowerCase()}`} className="h-9 rounded-lg border border-[#d9ddea] bg-white px-2 text-[13px] text-[#3a4263] outline-none focus:border-[#253D9A]">
                    <option value="">All {facetField.label.toLowerCase()}s</option>
                    {(facetField.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}
                <label className="relative block w-full sm:w-64">
                  <span className="sr-only">Search {label}s</span>
                  <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b93b3]" />
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${label}s`} className="h-9 w-full rounded-lg border border-[#d9ddea] bg-white pl-9 pr-3 text-[13px] text-[#171a2b] outline-none focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/15" />
                </label>
              </div>
            </div>

            {missingImages > 0 && (
              <p className="mb-3 flex items-center gap-2 text-[12.5px] text-[#9a6412]">
                <ImageIcon width={15} height={15} />
                {missingImages === 1 ? `1 ${label} has` : `${missingImages} ${label}s have`} no image yet.
              </p>
            )}

            {visible.length === 0 ? (
              <p className="rounded-xl border border-[#e3e6f0] bg-white px-6 py-10 text-center text-[13px] text-[#7d86a8]">Nothing matches these filters.</p>
            ) : (
              <ContentWorkflowPanel records={visible} session={session} showImages={showImages} onEdit={(record) => setDrawer({ mode: "edit", record })} onChanged={reload} />
            )}
            <p className="mt-3 text-[12px] text-[#8b93b3]">
              Showing {visible.length} of {records.length}
            </p>
          </>
        )}
      </section>

      <Drawer
        open={drawer !== null}
        title={drawer?.mode === "edit" ? `Edit ${label}` : (newLabel ?? `New ${label}`)}
        subtitle={drawer?.mode === "edit" ? drawer.record.title : "Saved as a draft; publish it from the list once reviewed."}
        onClose={() => setDrawer(null)}
      >
        {drawer?.mode === "create" && <SimpleDraftForm fields={resource.fields} dynamicOptions={options} note={note} onSubmit={handleCreate} onCancel={() => setDrawer(null)} />}
        {drawer?.mode === "edit" && (
          <SimpleDraftForm
            key={drawer.record.key}
            fields={resource.fields}
            dynamicOptions={options}
            initialValues={drawer.record.values}
            submitLabel="Save changes"
            onSubmit={(form) => handleSave(drawer.record, form)}
            onCancel={() => setDrawer(null)}
          />
        )}
        {drawer?.mode === "edit" && type === "dataset" && <DatasetFormatsPanel key={`formats-${drawer.record.key}`} slug={drawer.record.key} />}
        {drawer?.mode === "edit" && type === "publication" && (
          <StoryPreviewPanel key={`story-${drawer.record.key}`} slug={drawer.record.key} title={drawer.record.title} onChanged={reload} />
        )}
      </Drawer>
    </>
  );
}
