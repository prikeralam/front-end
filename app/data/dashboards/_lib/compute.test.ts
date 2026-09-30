import { describe, expect, it } from "vitest";
import { BlockDataError, attempt, barSeries, dumbbellSeries, groupedSeries, kpiValue, pairs, toNumber, type Table } from "./compute";

const batches: Table = {
  columns: ["district", "average_batch_size"],
  rows: [
    ["Malappuram", "65"],
    ["Pathanamthitta", "36"],
    ["Kerala (average)", "54"],
  ],
};
const religion: Table = {
  columns: ["group", "share_2011", "share_2024"],
  rows: [
    ["Hindus", 54.7, 52.0],
    ["Christians", 18.3, 17.6],
    ["Muslims", 26.5, 29.9],
  ],
};
const emigrants: Table = {
  columns: ["group", "population_share", "emigrant_share"],
  rows: [
    ["Hindus", "53.2", "35.2"],
    ["Muslims", "29.3", "41.9"],
  ],
};

describe("toNumber / pairs", () => {
  it("reads numbers written with commas or percent signs, and rejects text", () => {
    expect([toNumber("1,20,500"), toNumber("54.7%"), toNumber(3), toNumber("n/a"), toNumber(""), toNumber(null)]).toEqual([120500, 54.7, 3, NaN, NaN, NaN]);
  });

  it("pairs labels with values, skipping rows without a number", () => {
    expect(pairs({ columns: ["a", "b"], rows: [["x", "1"], ["y", "–"]] }, "a", "b")).toEqual([{ label: "x", value: 1 }]);
  });
});

describe("kpiValue", () => {
  const base = { type: "kpi" as const, label: "", dataset: "d", labelColumn: "district", column: "average_batch_size" };

  it("shows a single cell", () => {
    expect(kpiValue({ ...base, row: "Malappuram" }, batches)).toEqual({ value: 65, display: "65" });
  });

  it("compares with another row as a percentage, naming what it's compared with", () => {
    const k = kpiValue({ ...base, row: "Malappuram", compare: { row: "Kerala (average)", as: "percent" } }, batches);
    expect(k.display).toBe("+20.4%");
    expect(k.detail).toBe("above Kerala (average)");
    expect(kpiValue({ ...base, row: "Pathanamthitta", compare: { row: "Kerala (average)", as: "percent" } }, batches).detail).toBe("below Kerala (average)");
  });

  it("works out differences and ratios between columns of one row", () => {
    const change = kpiValue({ type: "kpi", label: "", dataset: "d", labelColumn: "group", row: "Muslims", column: "share_2024", compare: { column: "share_2011", as: "difference" } }, religion);
    expect(change.display).toBe("+3.4");
    expect(change.detail).toBeUndefined();
    const ratio = kpiValue({ type: "kpi", label: "", dataset: "d", labelColumn: "group", row: "Muslims", column: "emigrant_share", compare: { column: "population_share", as: "ratio" } }, emigrants);
    expect(ratio.display).toBe("1.43×");
    const labelled = kpiValue({ ...base, row: "Malappuram", compare: { row: "Kerala (average)", as: "percent", label: "the Kerala average" } }, batches);
    expect(labelled.detail).toBe("above the Kerala average");
  });

  it("explains a missing row or column instead of crashing", () => {
    expect(() => kpiValue({ ...base, row: "Kollam" }, batches)).toThrow(BlockDataError);
    expect(() => kpiValue({ ...base, row: "Malappuram", column: "seats" }, batches)).toThrow("isn't in this dataset");
  });
});

describe("chart series", () => {
  it("takes the reference row out of the bars, sorts, and marks highlights", () => {
    const s = barSeries({ type: "bar", dataset: "d", title: "", category: "district", value: "average_batch_size", reference: "Kerala (average)", highlight: ["Malappuram"], sort: "desc" }, batches);
    expect(s).toEqual({ labels: ["Malappuram", "Pathanamthitta"], values: [65, 36], highlighted: [true, false], reference: { label: "Kerala (average)", value: 54 } });
  });

  it("lines up several columns per row", () => {
    const g = groupedSeries({ type: "grouped-bar", dataset: "d", title: "", category: "group", series: [{ column: "population_share", label: "Population" }, { column: "emigrant_share", label: "Emigrants" }] }, emigrants);
    expect(g).toEqual({ labels: ["Hindus", "Muslims"], series: [{ label: "Population", values: [53.2, 29.3] }, { label: "Emigrants", values: [35.2, 41.9] }] });
  });

  it("orders before-and-after rows by their change, largest rise first", () => {
    const d = dumbbellSeries({ type: "dumbbell", dataset: "d", title: "", category: "group", from: { column: "share_2011", label: "2011" }, to: { column: "share_2024", label: "2024" } }, religion);
    expect(d.labels).toEqual(["Muslims", "Christians", "Hindus"]);
    expect(d.change.map((c) => Number(c.toFixed(1)))).toEqual([3.4, -0.7, -2.7]);
  });
});

describe("attempt", () => {
  it("turns a data problem into a message and lets other errors through", () => {
    expect(attempt(() => 1)).toEqual({ ok: true, value: 1 });
    expect(attempt(() => kpiValue({ type: "kpi", label: "", dataset: "d", labelColumn: "district", row: "Kollam", column: "average_batch_size" }, batches))).toEqual({
      ok: false,
      message: "No row named “Kollam” in this dataset.",
    });
    expect(() => attempt(() => { throw new TypeError("bug"); })).toThrow(TypeError);
  });
});
