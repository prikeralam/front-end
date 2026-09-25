import type { components } from "./schema";
import type { HeroProject } from "../../_content/projects";
import type { PRIDocument } from "../types";

type ApiProject = components["schemas"]["Project"];
type ApiDocument = components["schemas"]["Document"];

export function toProject(project: ApiProject): HeroProject {
  return {
    slug: project.slug,
    title: project.title,
    blurb: project.blurb,
    status: "real",
    image: {
      label: `${project.title} photograph`,
      ratio: "3:2",
      kind: "photo",
      src: project.image_url || undefined,
    },
    ctaLabel: project.cta_label || undefined,
    ctaHref: project.cta_href || undefined,
  };
}

/** "annual-report" -> "Annual Report". */
function humanize(documentType: string): string {
  return documentType
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function toDocument(document: ApiDocument): PRIDocument {
  return {
    title: document.title,
    kind: humanize(document.document_type ?? "") || "Document",
    year: document.year ? String(document.year) : undefined,
    status: "real",
    href: document.file,
  };
}
