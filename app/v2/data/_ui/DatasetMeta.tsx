"use client";

import { useEffect, useState } from "react";
import { getDownloadCount } from "../../../_lib/mockAuth";

export default function DatasetMeta({ slug, lastUpdated, frequency }: { slug: string; lastUpdated: string; frequency: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getDownloadCount(slug));
  }, [slug]);

  return (
    <p className="mt-1 text-[12px] text-[#8b8fa3]">
      Updated {lastUpdated} &middot; {frequency} &middot; {count} {count === 1 ? "download" : "downloads"}
    </p>
  );
}
