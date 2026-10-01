import * as stylex from '@stylexjs/stylex'
import type { Gable, LessonColor } from '../catalog'

// A house drawn from data: one window per entry, two columns, filling row by row.
// Colours are custom properties from tokens.css, never literals.
const W = 96
const ROOF = 34
const PAD = 13
const COL_GAP = 9
const ROW_GAP = 12
const GH = 28
const GW = (W - 2 * PAD - COL_GAP) / 2

const glow = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 0.22 } })

const styles = stylex.create({
  // Drawn at `width`, shrinking with the box it is in; the height follows the aspect ratio.
  svg: { display: 'block', maxWidth: '100%', height: 'auto', marginInline: 'auto' },
  window: {
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

export function houseHeight(entryCount: number): number {
  return 30 + 40 * Math.ceil(entryCount / 2) + ROOF
}

export function gablePath(gable: Gable, h: number): string {
  const w = W
  switch (gable) {
    case 'step':
      return `M0 34 L${w / 5} 34 L${w / 5} 22.4 L${(2 * w) / 5} 22.4 L${(2 * w) / 5} 11.2 L${(3 * w) / 5} 11.2 L${(3 * w) / 5} 22.4 L${(4 * w) / 5} 22.4 L${(4 * w) / 5} 34 L${w} 34 L${w} ${h} L0 ${h} Z`
    case 'bell':
      return `M0 40 Q${w * 0.18} 40 ${w * 0.24} 18.7 Q${w * 0.3} 1.7 ${w / 2} 0 Q${w * 0.7} 1.7 ${w * 0.76} 18.7 Q${w * 0.82} 40 ${w} 40 L${w} ${h} L0 ${h} Z`
    case 'point':
      return `M0 34 L${w / 2} 0 L${w} 34 L${w} ${h} L0 ${h} Z`
    case 'cornice':
      return `M0 18.7 L${w} 18.7 L${w} ${h} L0 ${h} Z`
  }
}

type Props = {
  color: LessonColor
  gable: Gable
  entryCount: number
  /** Indexes (in entry order) of the lit windows. */
  lit: ReadonlySet<number>
  width: number
}

export function House({ color, gable, entryCount, lit, width }: Props) {
  const h = houseHeight(entryCount)
  const frame = 'var(--window-frame)'
  const windows = Array.from({ length: entryCount }, (_, i) => {
    const x = PAD + (i % 2) * (GW + COL_GAP)
    const y = ROOF + PAD + Math.floor(i / 2) * (GH + ROW_GAP)
    return { i, x, y, isLit: lit.has(i) }
  })
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${h}`}
      width={width}
      height={(width * h) / W}
      aria-hidden="true"
      focusable="false"
      data-house={color}
      {...stylex.props(styles.svg)}
    >
      <path d={gablePath(gable, h)} fill={`var(--${color})`} data-part="facade" data-gable={gable} />
      {windows.map(({ i, x, y, isLit }) => (
        <g key={i} data-window={i} data-lit={isLit}>
          {isLit && (
            <rect
              x={x - 3}
              y={y - 3}
              width={GW + 6}
              height={GH + 6}
              rx={4}
              fill="var(--lamp)"
              data-part="glow"
              {...stylex.props(styles.glow)}
            />
          )}
          <rect
            x={x}
            y={y}
            width={GW}
            height={GH}
            rx={3}
            fill={isLit ? 'var(--lamp)' : 'var(--window-off)'}
            stroke={frame}
            strokeWidth={2}
            data-part="pane"
            {...stylex.props(styles.window)}
          />
          <path
            d={`M${x + GW / 2} ${y} V${y + GH} M${x} ${y + GH / 2} H${x + GW}`}
            stroke={frame}
            strokeWidth={1.6}
            opacity={0.9}
            fill="none"
          />
        </g>
      ))}
      <rect x={(W - 18) / 2} y={h - 24} width={18} height={24} rx={9} fill={frame} opacity={0.85} data-part="door" />
      <rect x={0} y={h - 8} width={W} height={8} fill="var(--ink)" opacity={0.12} data-part="baseboard" />
    </svg>
  )
}
