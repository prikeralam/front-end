import { describe, expect, it } from "vitest";
import type { GeoJsonFeatureCollection } from "./api/datasetAdapter";
import { buildGeoPreview } from "./geoPreview";

const size = { width: 600, height: 400, padding: 40 };

const collection = (...features: GeoJsonFeatureCollection["features"]): GeoJsonFeatureCollection => ({ type: "FeatureCollection", features });

describe("buildGeoPreview", () => {
  it("places points inside the padded frame, north up, with the first text property as caption", () => {
    const shapes = buildGeoPreview(
      collection(
        { type: "Feature", properties: { district: "Malappuram", size: 65 }, geometry: { type: "Point", coordinates: [76.07, 11.05] } },
        { type: "Feature", properties: { district: "Pathanamthitta", size: 36 }, geometry: { type: "Point", coordinates: [76.79, 9.26] } },
      ),
      size,
    );

    expect(shapes).toHaveLength(2);
    const [north, south] = shapes;
    if (north.kind !== "point" || south.kind !== "point") throw new Error("expected points");
    expect(north.caption).toBe("Malappuram");
    expect(north.label).toBe("district: Malappuram, size: 65");
    expect(north.y).toBeLessThan(south.y);
    for (const p of [north, south]) {
      expect(p.x).toBeGreaterThanOrEqual(40);
      expect(p.x).toBeLessThanOrEqual(560);
      expect(p.y).toBeGreaterThanOrEqual(40);
      expect(p.y).toBeLessThanOrEqual(360);
    }
  });

  it("closes polygon rings and leaves line strings open", () => {
    const shapes = buildGeoPreview(
      collection(
        { type: "Feature", properties: null, geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } },
        { type: "Feature", properties: null, geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] } },
      ),
      size,
    );

    expect(shapes.map((s) => s.kind === "path" && [s.filled, s.d.endsWith("Z")])).toEqual([
      [true, true],
      [false, false],
    ]);
  });

  it("centres a single point instead of dividing by a zero extent", () => {
    const [shape] = buildGeoPreview(collection({ type: "Feature", properties: null, geometry: { type: "Point", coordinates: [76, 11] } }), size);

    expect(shape).toMatchObject({ kind: "point", x: 300, y: 200 });
  });

  it("returns nothing for empty collections, null geometry and unknown geometry types", () => {
    expect(buildGeoPreview(collection(), size)).toEqual([]);
    expect(buildGeoPreview(collection({ type: "Feature", properties: null, geometry: null }), size)).toEqual([]);
    expect(buildGeoPreview(collection({ type: "Feature", properties: null, geometry: { type: "GeometryCollection", coordinates: [] } }), size)).toEqual([]);
  });
});
