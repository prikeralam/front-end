import type { GeoJsonFeatureCollection } from "./api/datasetAdapter";

type Pos = [number, number];

export type PreviewShape =
  | { kind: "point"; x: number; y: number; label: string; caption: string | null }
  | { kind: "path"; d: string; filled: boolean; label: string };

type Part = { kind: "point"; pos: Pos } | { kind: "line"; ring: Pos[]; closed: boolean };

const isPos = (value: unknown): value is Pos => Array.isArray(value) && typeof value[0] === "number" && typeof value[1] === "number";
const asPositions = (value: unknown): Pos[] => (Array.isArray(value) ? value.filter(isPos) : []);
const asRings = (value: unknown): Pos[][] => (Array.isArray(value) ? value.map(asPositions) : []);
const asPolygons = (value: unknown): Pos[][][] => (Array.isArray(value) ? value.map(asRings) : []);

function partsOf(geometry: { type: string; coordinates: unknown }): Part[] {
  const { type, coordinates } = geometry;
  switch (type) {
    case "Point":
      return isPos(coordinates) ? [{ kind: "point", pos: coordinates }] : [];
    case "MultiPoint":
      return asPositions(coordinates).map((pos) => ({ kind: "point", pos }));
    case "LineString":
      return [{ kind: "line", ring: asPositions(coordinates), closed: false }];
    case "MultiLineString":
      return asRings(coordinates).map((ring) => ({ kind: "line", ring, closed: false }));
    case "Polygon":
      return asRings(coordinates).map((ring) => ({ kind: "line", ring, closed: true }));
    case "MultiPolygon":
      return asPolygons(coordinates).flatMap((rings) => rings.map((ring): Part => ({ kind: "line", ring, closed: true })));
    default:
      return [];
  }
}

function describe(properties: Record<string, unknown> | null): { label: string; caption: string | null } {
  const entries = Object.entries(properties ?? {});
  const firstText = entries.find(([, value]) => typeof value === "string");
  return {
    label: entries.map(([key, value]) => `${key}: ${String(value)}`).join(", "),
    caption: firstText ? String(firstText[1]) : null,
  };
}

/**
 * Projects a GeoJSON collection into SVG coordinates inside `width` x `height` (equirectangular, longitude scaled by
 * the cosine of the middle latitude so shapes keep their proportions). Enough for a preview, not for measurement.
 */
export function buildGeoPreview(collection: GeoJsonFeatureCollection, { width, height, padding }: { width: number; height: number; padding: number }): PreviewShape[] {
  const features = collection.features.flatMap((feature) => {
    const { label, caption } = describe(feature.properties);
    return feature.geometry ? partsOf(feature.geometry).map((part) => ({ part, label, caption })) : [];
  });
  const positions = features.flatMap(({ part }) => (part.kind === "point" ? [part.pos] : part.ring));
  if (positions.length === 0) return [];

  const lons = positions.map(([lon]) => lon);
  const lats = positions.map(([, lat]) => lat);
  const [minLon, maxLon, minLat, maxLat] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
  const lonScale = Math.max(Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180), 0.1);
  const spanX = (maxLon - minLon) * lonScale;
  const spanY = maxLat - minLat;
  const scale = Math.min(spanX > 0 ? (width - 2 * padding) / spanX : Infinity, spanY > 0 ? (height - 2 * padding) / spanY : Infinity);
  const unit = Number.isFinite(scale) ? scale : 1;
  const offsetX = (width - spanX * unit) / 2;
  const offsetY = (height - spanY * unit) / 2;
  const project = ([lon, lat]: Pos) => ({ x: offsetX + (lon - minLon) * lonScale * unit, y: offsetY + (maxLat - lat) * unit });

  return features.flatMap(({ part, label, caption }): PreviewShape[] => {
    if (part.kind === "point") return [{ kind: "point", ...project(part.pos), label, caption }];
    if (part.ring.length === 0) return [];
    const d = part.ring.map((pos, i) => { const { x, y } = project(pos); return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ");
    return [{ kind: "path", d: part.closed ? `${d} Z` : d, filled: part.closed, label }];
  });
}
