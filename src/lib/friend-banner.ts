/** Twelve columns cover the page at both desktop and mobile icon sizes. */
export function friendBannerPairs<T>(items: readonly T[]): [T, T][] {
  if (!items.length) return [];
  const pairCount = Math.max(12, items.length);
  return Array.from({ length: pairCount }, (_, index) => [
    items[(index * 2) % items.length]!,
    items[(index * 2 + 1) % items.length]!,
  ]);
}
