import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { clock } from '../recorder/machine'
import type { useRecorder } from '../recorder/useRecorder'
import { colors, radii, space } from '../styles/tokens.stylex'
import { buttonProps, ui } from '../styles/ui'

const styles = stylex.create({
  block: { display: 'flex', flexDirection: 'column', gap: space.s12, marginBlock: space.s20 },
  dot: { width: 10, height: 10, borderRadius: radii.round, backgroundColor: colors.lamp, flexShrink: 0 },
  time: { display: 'inline-flex', alignItems: 'center', gap: space.s8 },
  glyph: { marginInlineEnd: space.s8, flexShrink: 0 },
})

const MESSAGES = {
  denied: 'The microphone is blocked. Allow it in your browser settings, then try again.',
  'no-microphone': 'No microphone found. Plug one in or check your settings.',
  failed: "Recording didn't work. Try again.",
} as const

const PRIVACY = 'Your recording stays on this device and is gone when you leave this page.'

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...stylex.props(styles.glyph)}>
      {children}
    </svg>
  )
}

const Mic = () => (
  <Glyph>
    <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
    <path d="M6 11 a6 6 0 0 0 12 0 M12 17 V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </Glyph>
)
const Square = () => (
  <Glyph>
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
  </Glyph>
)
const Triangle = () => (
  <Glyph>
    <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" />
  </Glyph>
)

type Props = { recorder: ReturnType<typeof useRecorder> }

/** The "Record yourself" block of an entry page: record, stop, hear the take, record again. */
export function Recorder({ recorder }: Props) {
  const { phase, elapsed, playPhase, playFailed } = recorder
  if (phase === 'unsupported') {
    return (
      <section aria-label="Record yourself" {...stylex.props(styles.block)}>
        <p {...stylex.props(ui.body)}>This browser can&apos;t record. You can still say it out loud.</p>
      </section>
    )
  }
  const wait = (label: string, kind: 'primary' | 'secondary') => (
    <button type="button" aria-disabled="true" aria-busy="true" {...buttonProps(kind, true)}>{label}</button>
  )
  const privacy = <p {...stylex.props(ui.hint)}>{PRIVACY}</p>
  const announced = phase === 'recording' ? 'Recording.' : phase === 'finishing' || phase === 'recorded' ? 'Recording stopped.' : ''
  let body: ReactNode = null
  if (phase === 'idle') {
    body = (
      <>
        <div {...stylex.props(ui.row)}>
          <button type="button" onClick={recorder.record} {...buttonProps('secondary')}><Mic />Record yourself</button>
        </div>
        {privacy}
      </>
    )
  } else if (phase === 'asking') {
    body = <div {...stylex.props(ui.row)}>{wait('Waiting for permission…', 'secondary')}</div>
  } else if (phase === 'recording' || phase === 'finishing') {
    body = (
      <>
        <div {...stylex.props(ui.row)}>
          {phase === 'recording' ? (
            <button type="button" onClick={recorder.stop} {...buttonProps('primary')}><Square />Stop</button>
          ) : (
            wait('Saving…', 'primary')
          )}
          <span {...stylex.props(ui.body, styles.time)}>
            <span aria-hidden="true" {...stylex.props(styles.dot)} />
            {`Recording… ${clock(elapsed)}`}
          </span>
        </div>
        {phase === 'recording' && privacy}
      </>
    )
  } else if (phase === 'recorded') {
    const busy = playPhase === 'starting'
    body = (
      <>
        <div {...stylex.props(ui.row)}>
          <button type="button" aria-busy={busy || undefined} onClick={recorder.hear} {...buttonProps('primary')}>
            {playPhase === 'idle' ? <><Triangle />Hear yourself</> : <><Square />Stop</>}
          </button>
          <button type="button" onClick={recorder.record} {...buttonProps('secondary')}>Record again</button>
        </div>
        {playFailed && <p role="status" {...stylex.props(ui.body)}>The recording didn&apos;t play. Try again.</p>}
        {privacy}
      </>
    )
  } else {
    body = (
      <>
        <p role="status" {...stylex.props(ui.body)}>{MESSAGES[phase]}</p>
        <div {...stylex.props(ui.row)}>
          <button type="button" onClick={recorder.record} {...buttonProps('secondary')}>Try again</button>
        </div>
      </>
    )
  }
  return (
    <section aria-label="Record yourself" {...stylex.props(styles.block)}>
      <p role="status" {...stylex.props(ui.hidden)}>{announced}</p>
      {body}
    </section>
  )
}
