"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createThemeAction, listThemesAction, updateThemeAction, type ThemeList } from "../../_lib/dashboard/themeActions";
import { THEME_LIMITS, slugify, type SubThemeNode, type ThemeNode } from "../../_lib/dashboard/themeTree";
import { canReviewDrafts } from "../../_lib/session";
import { useRequireSession } from "../../_lib/useSession";
import DashboardPageHeader, { primaryButton, secondaryButton } from "../_ui/DashboardPageHeader";
import Drawer from "../_ui/Drawer";
import { PlusIcon } from "../_ui/icons";

/** What the drawer is doing: adding a theme, adding a sub-theme under `parent`, or editing `item`. */
type Editing =
  | { mode: "new-theme" }
  | { mode: "new-sub"; parent: ThemeNode }
  | { mode: "edit"; item: SubThemeNode; parent?: ThemeNode }
  | null;

const slugChip = "rounded bg-[#eef0f5] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[#6f7899]";
const textLink = "rounded px-1.5 py-0.5 text-[12px] font-semibold text-[#253D9A] hover:bg-[#253D9A]/8 focus-visible:outline-2 focus-visible:outline-[#253D9A]";

/**
 * The theme taxonomy every dataset and publication is filed under: top-level themes, each with its sub-themes.
 * Editors and admins add and rename them here; dataset and publication forms then offer the new sub-themes.
 */
export default function ManageThemes() {
  const session = useRequireSession();
  const [list, setList] = useState<ThemeList | "loading">("loading");
  const [editing, setEditing] = useState<Editing>(null);
  const allowed = !!session && canReviewDrafts(session);

  const reload = useCallback(() => {
    listThemesAction()
      .then(setList)
      .catch(() => setList({ status: "error" }));
  }, []);

  useEffect(() => {
    if (allowed) reload();
  }, [allowed, reload]);

  if (!session) return null;
  const themes = list !== "loading" && list.status === "ok" ? list.themes : [];
  const subCount = themes.reduce((sum, t) => sum + t.subthemes.length, 0);

  function saved() {
    setEditing(null);
    reload();
  }

  return (
    <>
      <DashboardPageHeader
        trail={["Data", "Themes"]}
        title="Themes"
        description="The subjects datasets and publications are filed under. Each item goes in a sub-theme, so add the sub-theme here before using it in a form."
        actions={
          allowed ? (
            <button type="button" onClick={() => setEditing({ mode: "new-theme" })} className={primaryButton}>
              <PlusIcon width={16} height={16} /> New theme
            </button>
          ) : undefined
        }
      />

      <section className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        {!allowed ? (
          <p className="text-sm text-[#7d86a8]">Themes are managed by editors and admins.</p>
        ) : list === "loading" ? (
          <div role="status" aria-label="Loading" className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-white/80" />
            ))}
          </div>
        ) : list.status === "signed-out" ? (
          <p className="text-sm text-[#7d86a8]">
            Your session has ended. <a href="/account" className="font-semibold text-[#253D9A] hover:underline">Sign in again</a>.
          </p>
        ) : list.status === "forbidden" ? (
          <p className="text-sm text-[#7d86a8]">The server says this account may not view themes.</p>
        ) : list.status === "error" ? (
          <p className="text-sm text-[#c2502f]">We couldn&apos;t load the themes just now. Please refresh and try again.</p>
        ) : themes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d3d8e8] bg-white px-6 py-14 text-center">
            <p className="font-[family-name:var(--font-heading)] text-[17px] text-[#171a2b]">No themes yet</p>
            <p className="mt-1 text-[13px] text-[#7d86a8]">Add the first theme, then its sub-themes.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-[12.5px] text-[#7d86a8]">
              {themes.length} {themes.length === 1 ? "theme" : "themes"} · {subCount} {subCount === 1 ? "sub-theme" : "sub-themes"}
            </p>
            <ul className="grid gap-4 md:grid-cols-2">
              {themes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} onEdit={(item, parent) => setEditing({ mode: "edit", item, parent })} onAdd={() => setEditing({ mode: "new-sub", parent: theme })} />
              ))}
            </ul>
          </>
        )}
      </section>

      <Drawer
        open={editing !== null}
        title={editing?.mode === "new-theme" ? "New theme" : editing?.mode === "new-sub" ? "New sub-theme" : editing?.parent ? "Edit sub-theme" : "Edit theme"}
        subtitle={
          editing?.mode === "new-sub"
            ? `Under ${editing.parent.name}`
            : editing?.mode === "edit"
              ? editing.parent
                ? `${editing.parent.name} › ${editing.item.name}`
                : editing.item.name
              : "A top-level subject; datasets go in its sub-themes."
        }
        onClose={() => setEditing(null)}
      >
        {editing && <ThemeForm key={editing.mode === "edit" ? `edit-${editing.item.id}` : editing.mode === "new-sub" ? `sub-${editing.parent.id}` : "theme"} editing={editing} onSaved={saved} onCancel={() => setEditing(null)} />}
      </Drawer>
    </>
  );
}

function ThemeCard({ theme, onEdit, onAdd }: { theme: ThemeNode; onEdit: (item: SubThemeNode, parent?: ThemeNode) => void; onAdd: () => void }) {
  return (
    <li className="flex flex-col rounded-xl border border-[#e3e6f0] bg-white">
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-heading)] text-[17px] leading-snug text-[#171a2b]">{theme.name}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-2">
            <span className={slugChip}>{theme.slug}</span>
            <span className="text-[12px] text-[#8b93b3]">{theme.subthemes.length} {theme.subthemes.length === 1 ? "sub-theme" : "sub-themes"}</span>
          </p>
        </div>
        <button type="button" onClick={() => onEdit(theme)} className={textLink} aria-label={`Edit theme ${theme.name}`}>
          Edit
        </button>
      </div>
      {theme.description && <p className="mt-2 px-5 text-[12.5px] leading-relaxed text-[#5b6485]">{theme.description}</p>}

      {theme.subthemes.length > 0 ? (
        // A drawn tree: one vertical rule down the left, a short elbow into each sub-theme.
        <ul className="ml-7 mr-5 mt-3 border-l border-[#dfe3ee]" aria-label={`Sub-themes of ${theme.name}`}>
          {theme.subthemes.map((sub) => (
            <li key={sub.id} className="group relative flex items-start justify-between gap-3 py-1.5 pl-4 before:absolute before:left-0 before:top-[17px] before:h-px before:w-3 before:bg-[#dfe3ee]">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#2a3150]">{sub.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className={slugChip}>{sub.slug}</span>
                  {sub.description && <span className="truncate text-[12px] text-[#8b93b3]">{sub.description}</span>}
                </p>
              </div>
              <button type="button" onClick={() => onEdit(sub, theme)} className={`${textLink} opacity-70 group-hover:opacity-100`} aria-label={`Edit sub-theme ${sub.name}`}>
                Edit
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mx-5 mt-3 text-[12.5px] text-[#9a6412]">No sub-themes yet: datasets and publications can&apos;t be filed here until one exists.</p>
      )}

      <div className="mt-auto border-t border-[#eef0f5] px-5 py-2.5">
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[12.5px] font-semibold text-[#253D9A] hover:bg-[#253D9A]/8">
          <PlusIcon width={14} height={14} /> Add sub-theme
        </button>
      </div>
    </li>
  );
}

function ThemeForm({ editing, onSaved, onCancel }: { editing: NonNullable<Editing>; onSaved: () => void; onCancel: () => void }) {
  const existing = editing.mode === "edit" ? editing.item : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(existing?.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const shownSlug = existing || slugTouched ? slug : slugify(name);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = existing
      ? await updateThemeAction(existing.id, { name, description })
      : await createThemeAction({ name, slug: shownSlug, description, parentId: editing.mode === "new-sub" ? editing.parent.id : null });
    setSaving(false);
    if (result.ok) onSaved();
    else setError(result.error);
  }

  const input = "mt-1.5 w-full rounded-lg border border-[#d9ddea] bg-white px-3 py-2 text-[13.5px] text-[#171a2b] outline-none focus:border-[#253D9A] focus:ring-2 focus:ring-[#253D9A]/15";
  const label = "block text-[12.5px] font-semibold text-[#3a4263]";
  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
      <label className={label}>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={THEME_LIMITS.name} className={input} autoFocus />
      </label>
      <label className={label}>
        Slug
        <input
          value={shownSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          disabled={!!existing}
          required
          maxLength={THEME_LIMITS.slug}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={`${input} font-[family-name:var(--font-mono)] disabled:bg-[#f5f6fa] disabled:text-[#7d86a8]`}
        />
        <span className="mt-1 block text-[12px] font-normal text-[#8b93b3]">
          {existing ? "Fixed once created: public addresses use it." : "Used in web addresses. Filled from the name; lowercase letters, numbers and dashes."}
        </span>
      </label>
      <label className={label}>
        Description <span className="font-normal text-[#8b93b3]">(optional)</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={THEME_LIMITS.description} rows={4} className={input} />
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-[#c2502f]/10 px-3 py-2 text-[12.5px] text-[#a3401f]">
          {error}
        </p>
      )}
      <div className="mt-auto flex justify-end gap-2 border-t border-[#eef0f5] pt-4">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Saving…" : existing ? "Save changes" : editing.mode === "new-sub" ? "Add sub-theme" : "Add theme"}
        </button>
      </div>
    </form>
  );
}
