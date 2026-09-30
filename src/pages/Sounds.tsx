import * as stylex from '@stylexjs/stylex'
import { useRef, useState } from 'react'
import { sounds } from '../catalog/sounds'
import { SoundSection } from '../components/SoundSection'
import { TopBar } from '../components/TopBar'
import { APP_NAME } from '../constants'
import { usePage } from '../pageHooks'
import { useSpeech, type HearResult } from '../speech/useSpeech'
import { space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'
import { useWebMcp } from '../webmcp/helper'
import { soundsTools } from '../webmcp/soundsTools'

const styles = stylex.create({
  stack: { display: 'flex', flexDirection: 'column', gap: space.s24, marginTop: space.s24 },
  note: { margin: 0, marginTop: space.s12 },
})

const NO_VOICE = 'This device has no Danish voice, so there is no sound here. The sound guides still work.'
const NO_SPEECH = "This browser can't play sound. The sound guides still work."
const words = new Map(sounds.flatMap((card) => card.examples).map((example) => [example.id, example.da]))

export function Sounds() {
  const speech = useSpeech()
  const [active, setActive] = useState('')
  const last = useRef('') // read synchronously, so calls made before a re-render still see the last row
  usePage('sounds', `Sounds · ${APP_NAME}.`)

  // The play button's handler: the buttons and the hear_example tool both come here. The same
  // row again stops it; another row cancels the first and speaks.
  const hear = (id: string): Promise<HearResult> => {
    const word = words.get(id) ?? ''
    const same = last.current === id
    last.current = id
    setActive(id)
    return same ? speech.press(word) : speech.play(word)
  }

  const voice = speech.voice === 'none' && !speech.noVoice ? 'unknown' : speech.voice
  useWebMcp(soundsTools({ voice, hear }))

  return (
    <div {...stylex.props(ui.shell)}>
      <TopBar nav current="sounds" />
      <main {...stylex.props(ui.content)}>
        <h1 tabIndex={-1} {...stylex.props(ui.h1)}>Sounds</h1>
        <p {...stylex.props(ui.body)}>Danish has sounds English lacks. Hear each one, then say it.</p>
        {speech.noVoice && (
          <p role="note" {...stylex.props(ui.body, styles.note)}>{speech.supported ? NO_VOICE : NO_SPEECH}</p>
        )}
        {speech.failed && (
          <p role="status" {...stylex.props(ui.body, styles.note)}>The sound didn&apos;t play. Try again.</p>
        )}
        <div {...stylex.props(styles.stack)}>
          {sounds.map((card) => (
            <SoundSection key={card.id} card={card} active={active} status={speech.status} disabled={speech.noVoice} onHear={hear} />
          ))}
        </div>
      </main>
    </div>
  )
}
