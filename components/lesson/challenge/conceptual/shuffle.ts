// Small client-side shuffle for the challenge widgets. These render only after
// an async client load (never during SSR), so Math.random is safe here.

/** Fisher-Yates shuffle into a new array. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Like shuffle, but for inputs of length > 1 it avoids returning the original
 * order, so a "sequence" or "match" challenge is never shown already-solved.
 */
export function shuffleStable<T>(arr: readonly T[]): T[] {
  if (arr.length < 2) return arr.slice()
  let out = shuffle(arr)
  let guard = 0
  while (guard++ < 8 && out.every((v, i) => v === arr[i])) out = shuffle(arr)
  return out
}
