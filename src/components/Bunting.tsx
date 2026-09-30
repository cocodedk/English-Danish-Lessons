import * as stylex from '@stylexjs/stylex'

// 11 flags on a sagging string, each dropping over 700 ms with a 40 ms stagger (instant when motion is reduced).
const FLAGS = 11
const WIDTH = 360
const COLORS = ['gul', 'tegl', 'hav', 'salvie', 'rosa']

const drop = stylex.keyframes({
  from: { transform: 'translateY(-140px)' },
  to: { transform: 'translateY(0)' },
})

const styles = stylex.create({
  bunting: { display: 'block', width: '100%', maxWidth: 420, marginInline: 'auto', height: 'auto' },
  flag: {
    animationName: drop,
    animationDuration: { default: '700ms', '@media (prefers-reduced-motion: reduce)': '0s' },
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  d0: { animationDelay: { default: '0ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d1: { animationDelay: { default: '40ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d2: { animationDelay: { default: '80ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d3: { animationDelay: { default: '120ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d4: { animationDelay: { default: '160ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d5: { animationDelay: { default: '200ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d6: { animationDelay: { default: '240ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d7: { animationDelay: { default: '280ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d8: { animationDelay: { default: '320ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d9: { animationDelay: { default: '360ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
  d10: { animationDelay: { default: '400ms', '@media (prefers-reduced-motion: reduce)': '0s' } },
})

const delays = [styles.d0, styles.d1, styles.d2, styles.d3, styles.d4, styles.d5, styles.d6, styles.d7, styles.d8, styles.d9, styles.d10]

export function Bunting() {
  const flags = Array.from({ length: FLAGS }, (_, i) => {
    const x = 24 + (i * (WIDTH - 48)) / (FLAGS - 1)
    const t = x / WIDTH
    const y = 6 + 40 * t * (1 - t)
    return { i, x, y, color: COLORS[i % COLORS.length] }
  })
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WIDTH} 70`}
      aria-hidden="true"
      focusable="false"
      data-bunting=""
      {...stylex.props(styles.bunting)}
    >
      <path d={`M0 6 Q${WIDTH / 2} 26 ${WIDTH} 6`} fill="none" stroke="var(--ink)" strokeWidth={1.6} opacity={0.7} />
      {flags.map(({ i, x, y, color }) => (
        <polygon
          key={i}
          points={`${x - 13},${y} ${x + 13},${y} ${x},${y + 30}`}
          fill={`var(--${color})`}
          data-flag={i}
          {...stylex.props(styles.flag, delays[i])}
        />
      ))}
    </svg>
  )
}
