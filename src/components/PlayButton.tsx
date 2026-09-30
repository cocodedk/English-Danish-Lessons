import * as stylex from '@stylexjs/stylex'
import { colors, radii } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'
import type { SpeechStatus } from '../speech/useSpeech'

const SIZE = 60
const HALF = SIZE / 2

/** How far the button reaches into the Danish pane (half its height) plus 6 px of air: that pane's bottom padding. */
export const PLAY_OVERHANG = HALF + 6

const styles = stylex.create({
  button: {
    position: 'absolute',
    right: 18,
    bottom: -HALF,
    boxSizing: 'border-box',
    width: SIZE,
    height: SIZE,
    padding: 0,
    borderWidth: 0,
    borderRadius: radii.round,
    backgroundColor: colors.fjord,
    color: colors.onFjord,
    boxShadow: '0 0 0 5px var(--paper)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: { position: 'static', width: 48, height: 48, boxShadow: 'none', flexShrink: 0 },
  off: { opacity: 0.55, cursor: 'default' },
})

type Props = { da: string; status: SpeechStatus; disabled: boolean; onPress: () => void; inline?: boolean }

/** Plays the Danish, or stops it. It sits on the seam between the two panes, or in a row when `inline`. */
export function PlayButton({ da, status, disabled, onPress, inline = false }: Props) {
  const busy = status !== 'idle'
  const off = disabled && !busy // Stop stays live while a lookup or a speech runs
  return (
    <button
      type="button"
      aria-label={busy ? 'Stop' : `Hear ${da}`}
      aria-disabled={off || undefined}
      aria-busy={status === 'lookup' || undefined}
      onClick={() => {
        if (!off) onPress()
      }}
      {...stylex.props(ui.focusable, styles.button, inline && styles.inline, off && styles.off)}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {busy ? <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /> : <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" />}
      </svg>
    </button>
  )
}
