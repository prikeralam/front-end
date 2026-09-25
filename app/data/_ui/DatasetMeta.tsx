export default function DatasetMeta({ lastUpdated, frequency }: { lastUpdated: string; frequency: string }) {
  return (
    <p className="mt-1 text-[12px] text-[#8b8fa3]">
      Updated {lastUpdated} &middot; {frequency}
    </p>
  );
}
