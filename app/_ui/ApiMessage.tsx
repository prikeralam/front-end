/** Shown in place of a data-driven section when the backend is unreachable or has nothing published yet. */
export function LoadError({ what }: { what: string }) {
  return <p className="mt-8 text-[15px] text-[#5b5f74]">We couldn&apos;t load {what} just now. Please try again in a few minutes.</p>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 text-[15px] text-[#5b5f74]">{children}</p>;
}
