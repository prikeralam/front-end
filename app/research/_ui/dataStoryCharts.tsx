import PlotlyChart from "./PlotlyChart";
import type { Data, Layout } from "plotly.js-dist-min";

/** Colour tokens each version supplies so charts read as native to that design, not a foreign template. */
export type ChartPalette = {
  primary: string;
  secondary: string;
  text: string;
  textSoft: string;
  grid: string;
  fontFamily: string;
};

function gradient(values: number[], lo: number, hi: number, from: [number, number, number], to: [number, number, number], invert = false) {
  return values.map((v) => {
    let t = hi === lo ? 0 : Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
    if (invert) t = 1 - t;
    const r = Math.round(from[0] + t * (to[0] - from[0]));
    const g = Math.round(from[1] + t * (to[1] - from[1]));
    const b = Math.round(from[2] + t * (to[2] - from[2]));
    return `rgb(${r},${g},${b})`;
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Horizontal bar, sorted low→high, optionally colour-graded between two palette colours with a reference line. */
export function HBarChart({
  id, labels, values, palette, xTitle, unit = "", refLines, invertGradient, height = 460,
}: {
  id: string; labels: string[]; values: number[]; palette: ChartPalette; xTitle: string; unit?: string;
  refLines?: { x: number; label: string; color?: string; labelAtBottom?: boolean }[];
  invertGradient?: boolean;
  height?: number;
}) {
  const colors = gradient(values, Math.min(...values), Math.max(...values), hexToRgb(palette.secondary), hexToRgb(palette.primary), invertGradient);
  const data: Data[] = [
    {
      type: "bar", orientation: "h", x: values, y: labels,
      marker: { color: colors },
      hovertemplate: `%{y}<br>%{x:,}${unit}<extra></extra>`,
    },
  ];
  const layout: Partial<Layout> = {
    margin: { l: 150, r: 30, t: 10, b: 40 },
    xaxis: { gridcolor: palette.grid, zeroline: false, title: { text: xTitle } },
    yaxis: { automargin: true },
    showlegend: false,
  };
  if (refLines?.length) {
    layout.shapes = refLines.map((r) => ({ type: "line", x0: r.x, x1: r.x, y0: -0.5, y1: labels.length - 0.5, line: { color: r.color ?? palette.text, width: 1.5, dash: "dot" } }));
    layout.annotations = refLines.map((r) => ({
      x: r.x,
      y: r.labelAtBottom ? 0.4 : labels.length - 0.5,
      text: r.label,
      showarrow: false,
      yshift: r.labelAtBottom ? 0 : 14,
      xanchor: r.labelAtBottom ? "left" : undefined,
      xshift: r.labelAtBottom ? 6 : undefined,
      font: { size: r.labelAtBottom ? 10.5 : 11, color: r.color ?? palette.text },
    }));
  }
  return <PlotlyChart id={id} height={height} data={data} layout={layout} fontFamily={palette.fontFamily} textColor={palette.text} />;
}

/** Vertical grouped bar — 2 or 3 series across shared categories. */
export function GroupedBarChart({
  id, categories, series, palette, yTitle, yRange, xTitle, height = 420,
}: {
  id: string; categories: string[]; series: { name: string; values: number[]; color: string | string[] }[];
  palette: ChartPalette; yTitle: string; yRange?: [number, number]; xTitle?: string; height?: number;
}) {
  const data: Data[] = series.map((s) => ({
    x: categories, y: s.values, name: s.name, type: "bar",
    marker: { color: s.color },
    hovertemplate: `${s.name}<br>%{x}: %{y}<extra></extra>`,
  }));
  return (
    <PlotlyChart
      id={id}
      height={height}
      data={data}
      layout={{
        margin: { l: 60, r: 20, t: 20, b: 50 },
        barmode: "group",
        legend: { orientation: "h", y: -0.2 },
        xaxis: { gridcolor: palette.grid, title: xTitle ? { text: xTitle } : undefined },
        yaxis: { title: { text: yTitle }, gridcolor: palette.grid, range: yRange },
      }}
      fontFamily={palette.fontFamily}
      textColor={palette.text}
    />
  );
}

/** Horizontal diverging bar around a zero baseline. */
export function DivergingBarChart({
  id, groups, series, palette, xTitle, height = 320,
}: {
  id: string; groups: string[]; series: { name: string; values: number[]; colors: string[]; opacity?: number }[];
  palette: ChartPalette; xTitle: string; height?: number;
}) {
  const data: Data[] = series.map((s) => ({
    y: groups, x: s.values, type: "bar", orientation: "h", name: s.name,
    marker: { color: s.colors, opacity: s.opacity },
    hovertemplate: `%{y}, ${s.name}<br>%{x:+.1f} pts<extra></extra>`,
  }));
  return (
    <PlotlyChart
      id={id}
      height={height}
      data={data}
      layout={{
        margin: { l: 80, r: 30, t: 10, b: 50 },
        barmode: "group",
        legend: series.length > 1 ? { orientation: "h", y: -0.25 } : undefined,
        showlegend: series.length > 1,
        xaxis: { title: { text: xTitle }, gridcolor: palette.grid, zeroline: true, zerolinecolor: palette.text, zerolinewidth: 1.5 },
        yaxis: { gridcolor: palette.grid },
      }}
      fontFamily={palette.fontFamily}
      textColor={palette.text}
    />
  );
}

/** Labelled scatter plot, with a subset of points highlighted in the secondary colour. */
export function ScatterChart({
  id, points, palette, xTitle, yTitle, height = 440,
}: {
  id: string; points: { label: string; x: number; y: number; highlight?: boolean }[];
  palette: ChartPalette; xTitle: string; yTitle: string; height?: number;
}) {
  const data: Data[] = [
    {
      type: "scatter", mode: "text+markers",
      x: points.map((p) => p.x), y: points.map((p) => p.y), text: points.map((p) => p.label),
      textposition: "top center", textfont: { size: 10, color: palette.text },
      marker: {
        color: points.map((p) => (p.highlight ? palette.secondary : palette.primary)),
        size: points.map((p) => (p.highlight ? 13 : 9)),
        line: { color: "#fff", width: 1 },
      },
      hovertemplate: "%{text}<br>%{x}, %{y}<extra></extra>",
    },
  ];
  return (
    <PlotlyChart
      id={id}
      height={height}
      data={data}
      layout={{
        margin: { l: 60, r: 30, t: 20, b: 50 },
        xaxis: { title: { text: xTitle }, gridcolor: palette.grid },
        yaxis: { title: { text: yTitle }, gridcolor: palette.grid },
        showlegend: false,
      }}
      fontFamily={palette.fontFamily}
      textColor={palette.text}
    />
  );
}

/** Line + markers over time, with a dotted baseline and point call-outs. */
export function LineChart({
  id, x, y, palette, xTitle, yTitle, yRange, baseline, callouts, height = 420,
}: {
  id: string; x: number[]; y: number[]; palette: ChartPalette; xTitle: string; yTitle: string; yRange?: [number, number];
  baseline?: number;
  callouts?: { x: number; y: number; text: string; color?: string; ay?: number }[];
  height?: number;
}) {
  const highlightXs = new Set(callouts?.map((c) => c.x));
  const data: Data[] = [
    {
      type: "scatter", mode: "lines+markers", x, y,
      line: { color: palette.primary, width: 3, shape: "spline" },
      marker: {
        color: x.map((xi) => (highlightXs.has(xi) ? palette.secondary : palette.primary)),
        size: x.map((xi) => (highlightXs.has(xi) ? 9 : 6)),
      },
      hovertemplate: "%{x}<br>%{y:,}<extra></extra>",
    },
  ];
  const layout: Partial<Layout> = {
    margin: { l: 70, r: 30, t: 20, b: 40 },
    xaxis: { title: { text: xTitle }, gridcolor: palette.grid, dtick: 1 },
    yaxis: { title: { text: yTitle }, gridcolor: palette.grid, range: yRange },
  };
  if (baseline !== undefined) {
    layout.shapes = [{ type: "line", x0: Math.min(...x), x1: Math.max(...x), y0: baseline, y1: baseline, line: { color: palette.textSoft, width: 1, dash: "dot" } }];
  }
  if (callouts) {
    layout.annotations = callouts.map((c) => ({
      x: c.x, y: c.y, text: c.text, showarrow: true, arrowhead: 0, ax: 0, ay: c.ay ?? -24,
      font: { size: 11, color: c.color ?? palette.secondary },
    }));
  }
  return <PlotlyChart id={id} height={height} data={data} layout={layout} fontFamily={palette.fontFamily} textColor={palette.text} />;
}

/** Simple vertical bar chart with value labels above each bar. */
export function VBarChart({
  id, labels, values, colors, palette, yTitle, yRange, height = 400, note,
}: {
  id: string; labels: string[]; values: number[]; colors: string[]; palette: ChartPalette; yTitle: string; yRange?: [number, number]; height?: number;
  note?: { text: string; x: number; y: number };
}) {
  const data: Data[] = [
    {
      x: labels, y: values, type: "bar",
      marker: { color: colors },
      text: values.map((v) => (v > 1000 ? v.toLocaleString() : `${v}%`)),
      textposition: "outside",
      hovertemplate: "%{x}<br>%{y:,}<extra></extra>",
    },
  ];
  return (
    <PlotlyChart
      id={id}
      height={height}
      data={data}
      layout={{
        margin: { l: 60, r: 20, t: 20, b: 50 },
        showlegend: false,
        xaxis: { gridcolor: palette.grid },
        yaxis: { title: { text: yTitle }, gridcolor: palette.grid, range: yRange },
        annotations: note ? [{ x: note.x, y: note.y, text: note.text, showarrow: false, font: { size: 13, color: palette.secondary } }] : undefined,
      }}
      fontFamily={palette.fontFamily}
      textColor={palette.text}
    />
  );
}

/** Horizontal single-series bar (no gradient), for share-of-total breakdowns. */
export function HBarSimpleChart({
  id, labels, values, color, palette, xTitle, height = 400,
}: {
  id: string; labels: string[]; values: number[]; color: string; palette: ChartPalette; xTitle: string; height?: number;
}) {
  const data: Data[] = [
    {
      x: values, y: labels, type: "bar", orientation: "h",
      marker: { color },
      hovertemplate: "%{y}<br>%{x}%<extra></extra>",
    },
  ];
  return (
    <PlotlyChart
      id={id}
      height={height}
      data={data}
      layout={{
        margin: { l: 190, r: 30, t: 10, b: 40 },
        xaxis: { title: { text: xTitle }, gridcolor: palette.grid },
        showlegend: false,
      }}
      fontFamily={palette.fontFamily}
      textColor={palette.text}
    />
  );
}
