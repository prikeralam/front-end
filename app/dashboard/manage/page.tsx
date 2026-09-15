"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { datasetThemes, datasetGeographies, datasetYears, datasetFormats } from "../../_content/dashboards";
import { publicationThemes, publicationFormats, publicationLanguages } from "../../_content/publications";
import {
  getSession,
  getDraftDatasets,
  submitDraftDataset,
  decideDraftDataset,
  getDraftPublications,
  submitDraftPublication,
  decideDraftPublication,
  canContributeContent,
  canReviewDrafts,
  type MockSession,
} from "../../_lib/mockAuth";
import { PageHeader, SectionHeading } from "../../_ui/kit";
import DashboardTabs from "../_ui/DashboardTabs";

const statusLabel: Record<string, string> = { pending: "Pending review", approved: "Approved", rejected: "Rejected" };
const statusColor: Record<string, string> = {
  pending: "bg-[#E4633F]/10 text-[#E4633F]",
  approved: "bg-[#253D9A]/10 text-[#253D9A]",
  rejected: "bg-[#8b8fa3]/10 text-[#5b5f74]",
};

export default function ManageDatasetsV2() {
  const router = useRouter();
  const [session, setSession] = useState<MockSession | null | undefined>(undefined);
  const [tick, setTick] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState(datasetThemes[0]);
  const [geography, setGeography] = useState(datasetGeographies[0]);
  const [year, setYear] = useState(datasetYears[0]);
  const [fileFormat, setFileFormat] = useState(datasetFormats[0]);
  const [tags, setTags] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [pubTitle, setPubTitle] = useState("");
  const [pubAbstract, setPubAbstract] = useState("");
  const [pubFormat, setPubFormat] = useState(publicationFormats[0]);
  const [pubTheme, setPubTheme] = useState(publicationThemes[0]);
  const [pubLanguage, setPubLanguage] = useState(publicationLanguages[0]);
  const [pubSubmitted, setPubSubmitted] = useState(false);

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
  const allDrafts = getDraftDatasets();
  const mySubmissions = allDrafts.filter((d) => d.submittedByEmail === session.email);
  const toReview = allDrafts.filter((d) => d.status === "pending");

  const allPubDrafts = getDraftPublications();
  const myPubSubmissions = allPubDrafts.filter((d) => d.submittedByEmail === session.email);
  const pubToReview = allPubDrafts.filter((d) => d.status === "pending");

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
    setTick((t) => t + 1);
    setTimeout(() => setSubmitted(false), 3000);
  }

  function handlePublicationSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session || !pubTitle || !pubAbstract) return;
    submitDraftPublication({
      title: pubTitle,
      abstract: pubAbstract,
      format: pubFormat,
      theme: pubTheme,
      language: pubLanguage,
      submittedByEmail: session.email,
      submittedByName: session.name,
    });
    setPubTitle("");
    setPubAbstract("");
    setPubSubmitted(true);
    setTick((t) => t + 1);
    setTimeout(() => setPubSubmitted(false), 3000);
  }

  return (
    <>
      <PageHeader kicker="Your dashboard" title="Manage submissions" intro="Submit a new dataset or publication for review, or review what others have submitted." />
      <DashboardTabs />
      <section className="mx-auto max-w-3xl px-6 py-16">
        {!canContribute && !canReview && (
          <p className="text-sm text-[#8b8fa3]">
            Dataset and publication submission is limited to Researcher, Editor, and Admin roles. Sign in as one of those to preview this page.
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

        {mySubmissions.length > 0 && (
          <div className="mt-12">
            <SectionHeading>Your submissions</SectionHeading>
            <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {mySubmissions.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                    <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.theme} &middot; {d.geography} &middot; {d.year}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[d.status]}`}>{statusLabel[d.status]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {canReview && toReview.length > 0 && (
          <div className="mt-12 border-t border-[#e6e8f0] pt-10">
            <SectionHeading>Datasets awaiting review</SectionHeading>
            <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {toReview.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                    <p className="mt-1 line-clamp-1 text-[13px] text-[#5b5f74]">{d.description}</p>
                    <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.theme} &middot; {d.geography} &middot; {d.year} &middot; submitted by {d.submittedByName}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        decideDraftDataset(d.id, "approved");
                        setTick((t) => t + 1);
                      }}
                      className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        decideDraftDataset(d.id, "rejected");
                        setTick((t) => t + 1);
                      }}
                      className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {canContribute && (
          <div className="mt-16 border-t border-[#e6e8f0] pt-10">
            <SectionHeading>Submit a new publication</SectionHeading>
            <form onSubmit={handlePublicationSubmit} className="mt-6 space-y-4 rounded-xl border border-[#e6e8f0] bg-white p-6">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Title</label>
                <input value={pubTitle} onChange={(e) => setPubTitle(e.target.value)} required className="h-10 w-full rounded-lg border border-[#dcdee8] px-3 text-[14px]" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Abstract</label>
                <textarea value={pubAbstract} onChange={(e) => setPubAbstract(e.target.value)} required rows={3} className="w-full rounded-lg border border-[#dcdee8] px-3 py-2 text-[14px]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Format</label>
                  <select value={pubFormat} onChange={(e) => setPubFormat(e.target.value)} className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]">
                    {publicationFormats.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Theme</label>
                  <select value={pubTheme} onChange={(e) => setPubTheme(e.target.value)} className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]">
                    {publicationThemes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#8b8fa3]">Language</label>
                  <select value={pubLanguage} onChange={(e) => setPubLanguage(e.target.value)} className="h-10 w-full rounded-lg border border-[#dcdee8] px-2 text-[14px]">
                    {publicationLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="rounded-full bg-[#253D9A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1B2C70]">
                Submit for review
              </button>
              {pubSubmitted && <p className="text-[13px] font-semibold text-[#253D9A]">Submitted — an Editor or Admin will review it.</p>}
              <p className="text-[11px] text-[#8b8fa3]">
                Mock submission — demos the Draft&rarr;Review&rarr;Approve&rarr;Publish content workflow only; full
                publication-repository features (file versioning, DOI, citation export) belong to a separate,
                future-phase module.
              </p>
            </form>
          </div>
        )}

        {myPubSubmissions.length > 0 && (
          <div className="mt-12">
            <SectionHeading>Your publication submissions</SectionHeading>
            <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {myPubSubmissions.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                    <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.theme} &middot; {d.format} &middot; {d.language}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor[d.status]}`}>{statusLabel[d.status]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {canReview && pubToReview.length > 0 && (
          <div className="mt-12 border-t border-[#e6e8f0] pt-10">
            <SectionHeading>Publications awaiting review</SectionHeading>
            <ul className="mt-6 divide-y divide-[#e6e8f0] rounded-xl border border-[#e6e8f0] bg-white">
              {pubToReview.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#171a2b]">{d.title}</p>
                    <p className="mt-1 line-clamp-1 text-[13px] text-[#5b5f74]">{d.abstract}</p>
                    <p className="mt-1 text-[12px] text-[#8b8fa3]">{d.theme} &middot; {d.format} &middot; {d.language} &middot; submitted by {d.submittedByName}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        decideDraftPublication(d.id, "approved");
                        setTick((t) => t + 1);
                      }}
                      className="rounded-full border border-[#253D9A] px-3 py-1.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A] hover:text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        decideDraftPublication(d.id, "rejected");
                        setTick((t) => t + 1);
                      }}
                      className="rounded-full border border-[#8b8fa3]/40 px-3 py-1.5 text-[12px] font-semibold text-[#8b8fa3] hover:bg-[#8b8fa3]/10"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
