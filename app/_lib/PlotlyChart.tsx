"use client";

import { useEffect, useRef } from "react";
import type { Data, Layout, Config } from "plotly.js-dist-min";

type Props = {
  id: string;
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  height?: number;
  fontFamily?: string;
  textColor?: string;
};

/** Thin wrapper around Plotly for the Research & Publications data-story charts. */
export default function PlotlyChart({ id, data, layout, config, height = 420, fontFamily = "sans-serif", textColor = "#22263a" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("plotly.js-dist-min").then((Plotly) => {
      if (cancelled || !ref.current) return;
      Plotly.newPlot(
        ref.current,
        data,
        {
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: { family: fontFamily, color: textColor, size: 12.5 },
          ...layout,
        },
        { displayModeBar: false, responsive: true, ...config }
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={id} ref={ref} style={{ height }} />;
}
