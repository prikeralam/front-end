import type { DashboardSpec } from "./spec";

/**
 * The prototype dashboards, as descriptions. Adding a dashboard means adding an entry here (and, later, a record in
 * the backend); no chart code. They use only public datasets for now.
 */
export const DASHBOARDS: DashboardSpec[] = [
  {
    slug: "plus-one-classrooms",
    title: "Plus One classrooms",
    theme: "Education",
    headline: "Malappuram's Plus One batches are the most crowded of the districts shown.",
    summary: "Average number of students in a Plus One batch, by district, against the Kerala average.",
    story: "malappuram-classrooms",
    status: "prototype",
    audience: "public",
    blocks: [
      { type: "kpi", label: "Malappuram", dataset: "plus-one-batch-size", labelColumn: "district", row: "Malappuram", column: "average_batch_size", unit: "students per batch" },
      {
        type: "kpi",
        label: "Malappuram vs Kerala",
        dataset: "plus-one-batch-size",
        labelColumn: "district",
        row: "Malappuram",
        column: "average_batch_size",
        compare: { row: "Kerala (average)", as: "percent", label: "the Kerala average" },
      },
      { type: "kpi", label: "Kerala average", dataset: "plus-one-batch-size", labelColumn: "district", row: "Kerala (average)", column: "average_batch_size", unit: "students per batch" },
      {
        type: "bar",
        title: "Average students per Plus One batch",
        caption: "The dashed line is the Kerala average.",
        dataset: "plus-one-batch-size",
        category: "district",
        value: "average_batch_size",
        reference: "Kerala (average)",
        highlight: ["Malappuram"],
        sort: "desc",
        unit: "students",
        width: "full",
      },
      { type: "map", title: "Districts in this dataset", dataset: "plus-one-batch-size-map", width: "half" },
      { type: "table", title: "The figures", dataset: "plus-one-batch-size", width: "half" },
    ],
  },
  {
    slug: "religious-composition",
    title: "Religious composition, 2011 to 2024",
    theme: "Demography",
    headline: "Kerala's religious mix is shifting slowly.",
    summary: "Each community's share of Kerala's population in 2011 and 2024, in percent.",
    story: "kerala-population-mix",
    status: "prototype",
    audience: "public",
    blocks: [
      ...(["Muslims", "Christians", "Hindus"] as const).map((group) => ({
        type: "kpi" as const,
        label: group,
        dataset: "religious-composition",
        labelColumn: "group",
        row: group,
        column: "share_2024",
        compare: { column: "share_2011", as: "difference" as const },
        unit: "percentage points since 2011",
      })),
      {
        type: "dumbbell",
        title: "Share of the population, 2011 → 2024",
        caption: "Each line runs from the 2011 share to the 2024 share. Communities are ordered by their change.",
        dataset: "religious-composition",
        category: "group",
        from: { column: "share_2011", label: "2011" },
        to: { column: "share_2024", label: "2024" },
        unit: "%",
        width: "full",
      },
      { type: "table", title: "The figures", dataset: "religious-composition", width: "full" },
    ],
  },
  {
    slug: "emigrants-by-community",
    title: "Who emigrates from Kerala",
    theme: "Migration",
    headline: "Muslims and Christians make up a larger share of Kerala's emigrants than of its population.",
    summary: "Each community's share of Kerala's population compared with its share of emigrants, in percent.",
    story: "kerala-gulf-migration",
    status: "prototype",
    audience: "public",
    blocks: [
      ...(["Muslims", "Christians", "Hindus"] as const).map((group) => ({
        type: "kpi" as const,
        label: group,
        dataset: "emigrants-by-community",
        labelColumn: "group",
        row: group,
        column: "emigrant_share",
        compare: { column: "population_share", as: "ratio" as const },
        note: "Share of emigrants ÷ share of population. Above 1× means over-represented.",
      })),
      {
        type: "grouped-bar",
        title: "Share of the population and of emigrants",
        dataset: "emigrants-by-community",
        category: "group",
        series: [
          { column: "population_share", label: "Share of population" },
          { column: "emigrant_share", label: "Share of emigrants" },
        ],
        unit: "%",
        width: "full",
      },
      { type: "table", title: "The figures", dataset: "emigrants-by-community", width: "full" },
    ],
  },
];

export function dashboardBySlug(slug: string): DashboardSpec | undefined {
  return DASHBOARDS.find((d) => d.slug === slug);
}

/** Dashboards that read a dataset, for "Used in" links on its page. */
export function dashboardsUsing(datasetSlug: string): DashboardSpec[] {
  return DASHBOARDS.filter((d) => d.blocks.some((b) => b.dataset === datasetSlug));
}
