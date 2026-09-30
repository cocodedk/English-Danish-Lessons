export type WordSize = {
  /** CSS font size of the Danish word on the lesson page. */
  specimen: string
  specimenLine: number
  /** Font size in px of the Danish word on the Home card. */
  card: number
}

const TIERS: { upTo: number; size: WordSize }[] = [
  { upTo: 6, size: { specimen: 'clamp(72px, 22vw, 96px)', specimenLine: 0.95, card: 44 } },
  { upTo: 10, size: { specimen: 'clamp(52px, 15vw, 72px)', specimenLine: 1, card: 44 } },
  { upTo: 16, size: { specimen: 'clamp(36px, 10.5vw, 48px)', specimenLine: 1.05, card: 32 } },
  { upTo: Infinity, size: { specimen: 'clamp(28px, 8vw, 36px)', specimenLine: 1.1, card: 32 } },
]

/** The size of a Danish word by its length: a number, or a word counted by code point (spaces included). */
export function wordSize(word: number | string): WordSize {
  const n = typeof word === 'number' ? word : Array.from(word).length
  return (TIERS.find((t) => n <= t.upTo) ?? TIERS[TIERS.length - 1]).size
}
