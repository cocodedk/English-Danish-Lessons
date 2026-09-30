import * as stylex from '@stylexjs/stylex'
import { space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'

const glow = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 0.22 } })

const styles = stylex.create({
  row: { display: 'flex', alignItems: 'center', gap: space.s12, marginBlock: space.s16 },
  fill: {
    transitionProperty: 'fill',
    transitionDuration: { default: '350ms', '@media (prefers-reduced-motion: reduce)': '0s' },
    transitionTimingFunction: 'ease-out',
  },
  glow: {
    animationName: glow,
    animationDuration: { default: '350ms', '@media (prefers-reduced-motion: reduce)': '0s' },
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
})

/** The window glyph and its words: lit or not yet. Never colour alone. */
export function Lamp({ lit }: { lit: boolean }) {
  return (
    <div {...stylex.props(styles.row)}>
      <svg width="30" height="26" viewBox="0 0 30 26" aria-hidden="true" focusable="false" data-lit={lit}>
        {lit && <rect x="0" y="0" width="30" height="26" rx="4" fill="var(--lamp)" {...stylex.props(styles.glow)} />}
        <rect
          x="4"
          y="3"
          width="22"
          height="20"
          rx="3"
          fill={lit ? 'var(--lamp)' : 'var(--window-off)'}
          stroke="var(--edge)"
          strokeWidth="2"
          {...stylex.props(styles.fill)}
        />
        <path d="M15 3 V23 M4 13 H26" stroke="var(--edge)" strokeWidth="1.6" opacity="0.9" fill="none" />
      </svg>
      <span {...stylex.props(ui.body)}>{lit ? 'Lit' : 'Not lit yet'}</span>
    </div>
  )
}
