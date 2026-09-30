import * as stylex from '@stylexjs/stylex'

// Each colour points at a custom property declared in tokens.css, the only file with values.
export const colors = stylex.defineVars({
  sky: 'var(--sky)',
  paper: 'var(--paper)',
  ink: 'var(--ink)',
  inkSoft: 'var(--ink-soft)',
  line: 'var(--line)',
  edge: 'var(--edge)',
  fjord: 'var(--fjord)',
  onFjord: 'var(--on-fjord)',
  lamp: 'var(--lamp)',
  windowOff: 'var(--window-off)',
  windowFrame: 'var(--window-frame)',
  ground: 'var(--ground)',
  flag: 'var(--flag)',
  gul: 'var(--gul)',
  onGul: 'var(--on-gul)',
  tegl: 'var(--tegl)',
  onTegl: 'var(--on-tegl)',
  hav: 'var(--hav)',
  onHav: 'var(--on-hav)',
  salvie: 'var(--salvie)',
  onSalvie: 'var(--on-salvie)',
  rosa: 'var(--rosa)',
  onRosa: 'var(--on-rosa)',
})

export const fonts = stylex.defineVars({
  display: "'Bricolage Grotesque Variable', system-ui, sans-serif",
  body: "'Atkinson Hyperlegible Next Variable', system-ui, sans-serif",
  ipa: "'Noto Sans Variable', system-ui, sans-serif",
})

export const space = stylex.defineVars({
  s4: '4px',
  s8: '8px',
  s12: '12px',
  s16: '16px',
  s20: '20px',
  s24: '24px',
  s32: '32px',
  s44: '44px',
})

export const radii = stylex.defineVars({
  pill: '26px',
  card: '22px',
  round: '50%',
})
