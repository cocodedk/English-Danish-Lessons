import * as stylex from '@stylexjs/stylex'
import type { VoiceState } from '../speech/useSpeech'
import { colors, space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'

const styles = stylex.create({
  note: { marginBlock: space.s16 },
  title: { margin: 0, fontWeight: 700 },
  text: { margin: 0, marginTop: space.s8 },
  summary: {
    display: 'list-item',
    boxSizing: 'border-box',
    minHeight: 48,
    paddingBlock: space.s12,
    color: colors.fjord,
    fontWeight: 600,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  label: { margin: 0, marginTop: space.s12 },
  steps: { margin: 0, marginTop: space.s4, paddingInlineStart: space.s24 },
})

const ANDROID = [
  'Open Settings and search for “text-to-speech” (usually under General management, or under System, Languages and input).',
  'Choose Google Text-to-speech as the preferred engine, then open its settings with the gear.',
  'Tap Install voice data, choose Danish (Denmark) and download it.',
  'Come back to this page and reload it.',
]
const IPHONE = [
  'Open Settings, then Accessibility, then Read and Speak (older versions call it Spoken Content).',
  'Tap Voices, then Danish.',
  'Choose a voice and tap the download button next to it. Wait until it has finished.',
  'Come back to this page and reload it.',
]

function Steps({ name, steps }: { name: string; steps: string[] }) {
  return (
    <>
      <p {...stylex.props(ui.body, styles.label)}><strong>{name}</strong></p>
      <ol {...stylex.props(ui.body, styles.steps)}>
        {steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
    </>
  )
}

/** A fact about the device, like the storage note: it shows while there is no Danish sound and cannot be dismissed. */
export function VoiceNotice({ voice }: { voice: VoiceState }) {
  if (voice === 'unsupported') {
    return (
      <div role="note" {...stylex.props(ui.card, ui.body, styles.note)}>
        <p {...stylex.props(styles.title)}>No Danish sound in this browser.</p>
        <p {...stylex.props(styles.text)}>
          Hej. cannot play sound here. The sound guides under each word still work. Another browser may play it.
        </p>
      </div>
    )
  }
  if (voice !== 'none') return null
  return (
    <div role="note" {...stylex.props(ui.card, ui.body, styles.note)}>
      <p {...stylex.props(styles.title)}>No Danish sound on this device.</p>
      <p {...stylex.props(styles.text)}>
        Hej. plays Danish with a Danish voice your device already has, and this one has none. The sound guides under
        each word still work.
      </p>
      <details>
        <summary {...stylex.props(ui.focusable, styles.summary)}>How to add a Danish voice</summary>
        <p {...stylex.props(styles.text)}>Pick your device. Menu names vary a little by maker and version.</p>
        <Steps name="Android" steps={ANDROID} />
        <Steps name="iPhone" steps={IPHONE} />
        <p {...stylex.props(styles.text)}>
          Voices that need the internet are not used, because that would send the words to a speech service.
        </p>
      </details>
    </div>
  )
}
