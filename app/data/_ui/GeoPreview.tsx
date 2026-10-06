import type { GeoJsonFeatureCollection } from "../../_lib/api/datasetAdapter";
import { buildGeoPreview } from "../../_lib/geoPreview";

const WIDTH = 600;
const HEIGHT = 400;
/** Beyond this many points, per-point captions overlap into noise, so only tooltips remain. */
const MAX_CAPTIONS = 30;

/** Dependency-free SVG rendering of a dataset's GeoJSON. Hover a shape for its properties. */
export default function GeoPreview({ collection, title }: { collection: GeoJsonFeatureCollection; title: string }) {
  const shapes = buildGeoPreview(collection, { width: WIDTH, height: HEIGHT, padding: 40 });
  const showCaptions = shapes.length <= MAX_CAPTIONS;

  if (shapes.length === 0) return <p className="text-[13px] text-[#8b8fa3]">This file has no drawable geometry.</p>;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Map preview of ${title}`} className="w-full rounded-lg border border-[#e6e8f0] bg-white">
      {shapes.map((shape, i) =>
        shape.kind === "path" ? (
          <path key={i} d={shape.d} fill={shape.filled ? "#253D9A" : "none"} fillOpacity={0.15} stroke="#253D9A" strokeWidth={1.5}>
            <title>{shape.label}</title>
          </path>
        ) : (
          <g key={i}>
            <circle cx={shape.x} cy={shape.y} r={6} fill="#E4633F" stroke="#fff" strokeWidth={1.5}>
              <title>{shape.label}</title>
            </circle>
            {showCaptions && shape.caption && (
              <text x={shape.x + 10} y={shape.y + 4} fontSize={12} fill="#171a2b">
                {shape.caption}
              </text>
            )}
          </g>
        ),
      )}
    </svg>
  );
}
