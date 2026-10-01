import * as stylex from '@stylexjs/stylex'

export const GAP = 6
export const MIN = 48
export const MAX = 96

// One width rule for the houses row and the titles row: every item is as wide as lets all
// `--lessons` of them fit in the row, within MIN and MAX. The row's own width is the 100%.
export const streetItem = stylex.create({
  width: {
    flexShrink: 0,
    width: `clamp(${MIN}px, calc((100% - ${GAP}px * (var(--lessons) - 1)) / var(--lessons)), ${MAX}px)`,
  },
  // The street is as wide as the screen, and wider only when even MIN-wide items do not fit.
  street: {
    minWidth: `calc(${MIN}px * var(--lessons) + ${GAP}px * (var(--lessons) - 1))`,
  },
  row: { gap: GAP },
})
