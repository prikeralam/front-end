/** Placeholder rows while a data page loads: the shape of what's coming, pulsing gently (still under reduced motion). */
export default function DataSkeleton({ rows = 5, withHeader = true }: { rows?: number; withHeader?: boolean }) {
  const bar = "rounded bg-[#e3e6f0] motion-safe:animate-pulse";
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-6xl px-6 py-14">
      {withHeader && (
        <div className="mb-10 grid gap-4">
          <div className={`${bar} h-3 w-40`} />
          <div className={`${bar} h-10 w-full max-w-lg`} />
          <div className={`${bar} h-4 w-full max-w-md`} />
        </div>
      )}
      <div className="divide-y divide-[#e3e6f0] overflow-hidden rounded-lg border border-[#e3e6f0] bg-white">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="grid gap-2.5 px-5 py-4">
            <div className={`${bar} h-4`} style={{ width: `${60 - (i % 3) * 12}%` }} />
            <div className={`${bar} h-3 w-4/5`} />
            <div className={`${bar} h-3 w-1/3`} />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading datasets…</span>
    </div>
  );
}
