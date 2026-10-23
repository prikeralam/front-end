/** Where a fixed menu of `itemCount` rows goes for a button at `rect`: below it, or above when it wouldn't fit below. */
export function menuPlacement(
  rect: { top: number; bottom: number; right: number },
  viewport: { width: number; height: number },
  itemCount: number,
): { position: "fixed"; right: number; top?: number; bottom?: number } {
  const height = itemCount * 36 + 10;
  const below = viewport.height - rect.bottom;
  const right = viewport.width - rect.right;
  return below < height + 8 && rect.top > below
    ? { position: "fixed", right, bottom: viewport.height - rect.top + 4 }
    : { position: "fixed", right, top: rect.bottom + 4 };
}
