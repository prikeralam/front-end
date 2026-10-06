import type { Data, Layout } from "plotly.js-dist-min";
import type { BarSeries, DumbbellSeries, GroupedSeries } from "./compute";

/** PRI's chart palette: blue carries the data, gold marks what the dashboard is pointing at, grey is context. */
export const CHART = {
  blue: "#253D9A",
  paleBlue: "#9fb0e6",
  gold: "#C9972C",
  grey: "#9aa2bd",
  grid: "#edf0f6",
  ink: "#171a2b",
  muted: "#5b6280",
  body: "var(--font-body), ui-sans-serif, system-ui, sans-serif",
  mono: "var(--font-mono), ui-monospace, monospace",
};

export type ChartFigure = { data: Data[]; layout: Partial<Layout>; height: number };

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(n);

/** Height that gives every row of a horizontal chart room to breathe, within sensible limits. */
const rowsHeight = (rows: number) => Math.max(200, Math.min(560, 70 + rows * 56));

const axis = { gridcolor: CHART.grid, zerolinecolor: CHART.grid, tickfont: { family: CHART.mono, size: 11.5, color: CHART.muted }, automargin: true };

export function barFigure(s: BarSeries, unit = ""): ChartFigure {
  const suffix = unit ? ` ${unit}` : "";
  const data: Data[] = [
    {
      type: "bar",
      orientation: "h",
      y: s.labels,
      x: s.values,
      marker: { color: s.highlighted.map((h) => (h ? CHART.gold : CHART.blue)) },
      text: s.values.map(fmt),
      textposition: "outside",
      textfont: { family: CHART.mono, size: 12, color: CHART.ink },
      cliponaxis: false,
      hovertemplate: `%{y}: %{x}${suffix}<extra></extra>`,
    },
  ];
  const max = Math.max(...s.values, s.reference?.value ?? 0);
  const layout: Partial<Layout> = {
    margin: { l: 8, r: 40, t: s.reference ? 34 : 8, b: 36 },
    xaxis: { ...axis, range: [0, max * 1.15], title: { text: unit, font: { size: 11.5, color: CHART.muted } } },
    yaxis: { ...axis, autorange: "reversed", tickfont: { family: CHART.body, size: 13, color: CHART.ink }, gridcolor: "rgba(0,0,0,0)" },
    bargap: 0.35,
    showlegend: false,
  };
  if (s.reference) {
    layout.shapes = [{ type: "line", xref: "x", yref: "paper", x0: s.reference.value, x1: s.reference.value, y0: 0, y1: 1, line: { color: CHART.grey, width: 1.5, dash: "dash" } }];
    layout.annotations = [
      {
        xref: "x",
        yref: "paper",
        x: s.reference.value,
        y: 1,
        yanchor: "bottom",
        showarrow: false,
        text: `${s.reference.label}: ${fmt(s.reference.value)}`,
        font: { family: CHART.mono, size: 11.5, color: CHART.muted },
      },
    ];
  }
  return { data, layout, height: rowsHeight(s.labels.length) };
}

export function groupedFigure(s: GroupedSeries, unit = ""): ChartFigure {
  const colours = [CHART.paleBlue, CHART.blue, CHART.gold, CHART.grey];
  const suffix = unit ? `${unit === "%" ? "" : " "}${unit}` : "";
  const data: Data[] = s.series.map((series, i) => ({
    type: "bar",
    name: series.label,
    x: s.labels,
    y: series.values,
    marker: { color: colours[i % colours.length] },
    text: series.values.map((v) => `${fmt(v)}${suffix}`),
    textposition: "outside",
    textfont: { family: CHART.mono, size: 11.5, color: CHART.ink },
    cliponaxis: false,
    hovertemplate: `%{x}, ${series.label}: %{y}${suffix}<extra></extra>`,
  }));
  const max = Math.max(...s.series.flatMap((x) => x.values.filter((v) => !Number.isNaN(v))));
  return {
    data,
    layout: {
      barmode: "group",
      bargap: 0.3,
      bargroupgap: 0.08,
      margin: { l: 8, r: 8, t: 48, b: 36 },
      xaxis: { ...axis, tickfont: { family: CHART.body, size: 13, color: CHART.ink }, gridcolor: "rgba(0,0,0,0)" },
      yaxis: { ...axis, range: [0, max * 1.18], ticksuffix: unit === "%" ? "%" : "" },
      legend: { orientation: "h", x: 0, y: 1, yanchor: "bottom", yref: "container", font: { family: CHART.body, size: 12.5, color: CHART.ink } },
    },
    height: 380,
  };
}

export function dumbbellFigure(s: DumbbellSeries, fromLabel: string, toLabel: string, unit = ""): ChartFigure {
  const suffix = unit ? `${unit === "%" ? "" : " "}${unit}` : "";
  const connectors: Data = {
    type: "scatter",
    mode: "lines",
    x: s.labels.flatMap((_, i) => [s.from[i], s.to[i], null]),
    y: s.labels.flatMap((l) => [l, l, null]),
    line: { color: CHART.grey, width: 3 },
    hoverinfo: "skip",
    showlegend: false,
  };
  const point = (values: number[], name: string, colour: string, filled: boolean): Data => ({
    type: "scatter",
    mode: "text+markers",
    name,
    x: values,
    y: s.labels,
    marker: { size: 14, color: filled ? colour : "#ffffff", line: { color: colour, width: 2.5 } },
    text: values.map((v) => `${fmt(v)}${suffix}`),
    textposition: filled ? "top center" : "bottom center",
    textfont: { family: CHART.mono, size: 11.5, color: filled ? CHART.ink : CHART.muted },
    cliponaxis: false,
    hovertemplate: `%{y}, ${name}: %{x}${suffix}<extra></extra>`,
  });
  const all = [...s.from, ...s.to];
  const pad = (Math.max(...all) - Math.min(...all)) * 0.15 || 1;
  return {
    data: [connectors, point(s.from, fromLabel, CHART.grey, false), point(s.to, toLabel, CHART.blue, true)],
    layout: {
      margin: { l: 8, r: 16, t: 56, b: 36 },
      xaxis: { ...axis, range: [Math.min(...all) - pad, Math.max(...all) + pad], ticksuffix: unit === "%" ? "%" : "" },
      yaxis: { ...axis, autorange: "reversed", tickfont: { family: CHART.body, size: 13, color: CHART.ink }, gridcolor: "rgba(0,0,0,0)" },
      legend: { orientation: "h", x: 0, y: 1, yanchor: "bottom", yref: "container", font: { family: CHART.body, size: 12.5, color: CHART.ink } },
    },
    height: rowsHeight(s.labels.length) + 40,
  };
}
