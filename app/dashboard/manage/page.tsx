"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { datasetThemes, datasetGeographies, datasetYears, datasetFormats } from "../../_content/dashboards";
import {
  getSession,
  getDraftDatasets,
  submitDraftDataset,
  decideDraftDataset,
  updateDraftDataset,
  deleteDraftDataset,
  canContributeContent,
  canReviewDrafts,
  type DraftDataset,
  type MockSession,
} from "../../_lib/mockAuth";
import { PageHeader, SectionHeading } from "../../_ui/kit";
import SimpleDraftForm from "../_ui/SimpleDraftForm";

const statusLabel: Record<string, string> = { pending: "Pending review", approved: "Approved", rejected: "Rejected" };
const statusColor: Record<string, string> = {
  pending: "bg-[#E4633F]/10 text-[#E4633F]",
  approved: "bg-[#253D9A]/10 text-[#253D9A]",
  rejected: "bg-[#8b8fa3]/10 text-[#5b5f74]",
};

const editFields = [
  { key: "title", label: "Title", kind: "text" as const },
  { key: "description", label: "Description", kind: "textarea" as const },
  { key: "theme", label: "Theme", kind: "select" as const, options: datasetThemes },
  { key: "geography", label: "Geography", kind: "select" as const, options: datasetGeographies },
  { key: "year", label: "Year", kind: "select" as const, options: datasetYears },
  { key: "fileFormat", label: "File format", kind: "select" as const, options: datasetFormats },
  { key: "tags", label: "Tags (comma-separated)", kind: "text" as const },
];

function toFormValues(d: DraftDataset): Record<string, string> {
  return {
    title: d.title,
    description: d.description,
    theme: d.theme,
    geography: d.geography,
    year: d.year,
    fileFormat: d.fileFormat,
    tags: d.tags.join(", "),
  };
}

function buildEditData(values: Record<string, string>) {
  return {
    title: values.title,
    description: values.description,
    theme: values.theme,
    geography: values.geography,
    year: values.year,
    fileFormat: values.fileFormat,
    tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
  };
}

export default function ManageDatasetsV2() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState(datasetThemes[0]);
  const [geography, setGeography] = useState(datasetGeographies[0]);
  const [year, setYear] = useState(datasetYears[0]);
  const [fileFormat, setFileFormat] = useState(datasetFormats[0]);
  const [tags, setTags] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/account");
      return;
    }
    setSession(s);
  }, [router, tick]);

  if (!session) return null;

  const canContribute = canContributeContent(session);
  const canReview = canReviewDrafts(session);
  const allDrafts = [...getDraftDatasets()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const bump = () => setTick((t) => t + 1);

  function canEdit(d: DraftDataset) {
    return (d.submittedByEmail === session!.email && canContribute) || canReview;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session || !title || !description) return;
    submitDraftDataset({
      title,
      description,
      theme,
      geography,
      year,
      fileFormat,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      submittedByEmail: session.email,
      submittedByName: session.name,
    });
    setTitle("");
    setDescription("");
    setTags("");
    setSubmitted(true);
    bump();
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handleSaveEdit(id: string, values: Record<string, string>) {
    updateDraftDataset(id, buildEditData(values));
    setEditingId(null);
    bump();
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this dataset draft? This can't be undone.")) return;
    deleteDraftDataset(id);
    bump();
  }

  return (
    <>
      <PageHeader kicker="Your dashboard" title="Manage datasets" intro="Submit a new dataset for review, or review what others have submitted." />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContribute && !canReview && (
          <p className="text-sm text-[#8b8fa3]">
            Dataset submission is limited to Researcher, Editor, and Admin roles. Sign in as one of those to preview this page.
          </p>
        )}

        {canContribute && (
          <div className="mt-10">
            <SectionHeading>Submit a new dataset</SectionHeading>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-[#e6e8f0] bg-white p-6">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className="h-10 w-full rounded-lg border border-[#dcdee8] px-3 text-[14px]" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full rounded-lg border border-[#dcdee8] px-3 py-2 text-[14px]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Theme</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)} className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]">
                    {datasetThemes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Geography</label>
                  <select value={geography} onChange={(e) => setGeography(e.target.value)} className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]">
                    {datasetGeographies.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Year</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]">
                    {datasetYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">File format</label>
                  <select value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]">
                    {datasetFormats.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Tags (comma-separated)</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="education, kerala, schools" className="h-10 w-full rounded-lg border border-[#dcdee8] px-3 text-[14px]" />
              </div>
              <button type="submit" className="rounded-full bg-[#253D9A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
                Submit for review
              </button>
              {submitted && <p className="text-[13px] font-semibold text-[#253D9A]">Submitted — an Editor or Admin will review it.</p>}
              <p className="text-[11px] text-[#8b8fa3]">Mock submission — no file upload or real catalog entry happens yet; this demos the review workflow only.</p>
            </form>
          </div>
        )}

        {allDrafts.length > 0 && (
          <div className="mt-12">
            <SectionHeading>All datasets</SectionHeading>
            <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {allDrafts.map((d) => {
                const editable = canEdit(d);
                return (
                  <li key={d.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                        <p className="mt-1 line-clamp-1 text-[13px] text-[#5b5f74]">{d.description}</p>
                        <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.theme} &middot; {d.geography} &middot; {d.year} &middot; submitted by {d.submittedByName}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {canReview && d.status === "pending" && (
                          <>
                            <button
                              onClick={() => { decideDraftDataset(d.id, "approved"); bump(); }}
                              className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { decideDraftDataset(d.id, "rejected"); bump(); }}
                              className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {editable && (
                          <button
                            onClick={() => setEditingId(editingId === d.id ? null : d.id)}
                            className="rounded-full border border-[#dcdee8] px-3 py-1.5 text-[12px] font-semibold text-[#5b5f74] hover:bg-[#f0f1f5]"
                          >
                            {editingId === d.id ? "Close" : "Edit"}
                          </button>
                        )}
                        {editable && (
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="rounded-full border border-[#E4633F]/40 px-3 py-1.5 text-[12px] font-semibold text-[#E4633F] hover:bg-[#E4633F]/10"
                          >
                            Delete
                          </button>
                        )}
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[d.status]}`}>{statusLabel[d.status]}</span>
                      </div>
                    </div>
                    {editingId === d.id && (
                      <div className="mt-4">
                        <SimpleDraftForm
                          title="Edit dataset"
                          fields={editFields}
                          initialValues={toFormValues(d)}
                          submitLabel="Save changes"
                          onCancel={() => setEditingId(null)}
                          onSubmit={(values) => handleSaveEdit(d.id, values)}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
