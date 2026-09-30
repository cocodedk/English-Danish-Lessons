import * as stylex from '@stylexjs/stylex'
import type { Entry, LessonColor } from '../catalog'
import type { useSpeech } from '../speech/useSpeech'
import { fonts, space } from '../styles/tokens.stylex'
import { facade } from './facade'
import { PlayButton } from './PlayButton'
import { Pronunciation } from './Pronunciation'
import { wordSize } from './wordSize'

const styles = stylex.create({
  // The play button is absolutely placed on this box's bottom edge, so it follows the seam wherever it falls.
  seam: { position: 'relative' },
  danish: {
    boxSizing: 'border-box',
    minHeight: 170,
    paddingTop: 44,
    paddingBottom: 20,
    paddingInline: 22,
    clipPath:
      'polygon(0 26px, 14% 26px, 14% 17px, 28% 17px, 28% 8px, 44% 8px, 44% 0, 56% 0, 56% 8px, 72% 8px, 72% 17px, 86% 17px, 86% 26px, 100% 26px, 100% 100%, 0 100%)',
  },
  word: (fontSize: string, lineHeight: number) => ({
    margin: 0,
    fontFamily: fonts.display,
    fontSize,
    lineHeight,
    fontWeight: 800,
    letterSpacing: '-0.035em',
    overflowWrap: 'break-word',
  }),
  small: { marginTop: space.s8 },
})

const NO_VOICE = 'This device has no Danish voice, so there is no sound. Use the sound guide above.'
const NO_SPEECH = "This browser can't play sound. Use the sound guide above."
// Where the recorder can play a take back, the notices must not claim there is no sound at all.
const NO_VOICE_REC = 'This device has no Danish voice, so the word has no sound. Use the sound guide above.'
const NO_SPEECH_REC = "This browser can't play the Danish voice. Use the sound guide above."

type Props = {
  entry: Entry
  color: LessonColor
  speech: ReturnType<typeof useSpeech>
  onHear: () => void
  /** The recorder can play a take on this page. */
  recordable: boolean
  /** Hearing the Danish is off, as while recording. */
  hearOff: boolean
}

/** The Danish pane of a lesson entry: the word, its two pronunciation helps and the play button on the seam. */
export function Specimen({ entry, color, speech, onHear, recordable, hearOff }: Props) {
  const size = wordSize(entry.da)
  const noVoice = recordable ? NO_VOICE_REC : NO_VOICE
  const noSpeech = recordable ? NO_SPEECH_REC : NO_SPEECH
  return (
    <div {...stylex.props(styles.seam)}>
      <div {...stylex.props(styles.danish, facade[color])}>
        <h1 tabIndex={-1} lang="da" {...stylex.props(styles.word(size.specimen, size.specimenLine))}>{entry.da}</h1>
        <Pronunciation respelling={entry.respelling} ipa={entry.ipa} />
        {speech.noVoice && (
          <p role="note" {...stylex.props(styles.small)}>{speech.supported ? noVoice : noSpeech}</p>
        )}
        {speech.failed && <p role="status" {...stylex.props(styles.small)}>The sound didn&apos;t play. Try again.</p>}
      </div>
      <PlayButton da={entry.da} status={speech.status} disabled={speech.noVoice || hearOff} onPress={onHear} />
    </div>
  )
}
