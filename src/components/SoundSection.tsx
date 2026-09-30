import * as stylex from '@stylexjs/stylex'
import type { SoundCard } from '../catalog/sounds'
import type { SpeechStatus } from '../speech/useSpeech'
import { colors, fonts, space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'
import { facade } from './facade'
import { PlayButton } from './PlayButton'
import { Pronunciation } from './Pronunciation'

const styles = stylex.create({
  header: { display: 'flex', alignItems: 'center', gap: space.s16 },
  tile: (fontSize: number) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: 72,
    height: 72,
    fontFamily: fonts.display,
    fontSize,
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  }),
  title: { margin: 0, overflowWrap: 'anywhere' },
  paragraphs: { display: 'flex', flexDirection: 'column', gap: space.s12, marginTop: space.s16 },
  examples: { listStyle: 'none', margin: 0, marginTop: space.s16, padding: 0 },
  example: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: space.s16,
    paddingBlock: space.s16,
    borderTopStyle: 'solid',
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  block: { display: 'flex', flexDirection: 'column', gap: space.s4, minWidth: 0 },
  word: {
    margin: 0,
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    overflowWrap: 'break-word',
  },
})

type Props = {
  card: SoundCard
  /** The example now playing or being looked up, and its status. */
  active: string
  status: SpeechStatus
  disabled: boolean
  onHear: (exampleId: string) => void
}

/** One sound card: a tile and title, the explanation, then three example words to hear. */
export function SoundSection({ card, active, status, disabled, onHear }: Props) {
  return (
    <section {...stylex.props(ui.card)}>
      <div {...stylex.props(styles.header)}>
        <div aria-hidden="true" {...stylex.props(styles.tile(card.mark.length > 1 ? 28 : 40), facade[card.color])}>
          {card.mark}
        </div>
        <h2 {...stylex.props(ui.h2, styles.title)}>{card.title}</h2>
      </div>
      <div {...stylex.props(styles.paragraphs)}>
        {card.paragraphs.map((text) => (
          <p key={text} {...stylex.props(ui.body)}>{text}</p>
        ))}
      </div>
      <ul {...stylex.props(styles.examples)}>
        {card.examples.map((example) => (
          <li key={example.id} {...stylex.props(styles.example)}>
            <PlayButton
              inline
              da={example.da}
              status={active === example.id ? status : 'idle'}
              disabled={disabled}
              onPress={() => onHear(example.id)}
            />
            <div {...stylex.props(styles.block)}>
              <p lang="da" {...stylex.props(styles.word)}>{example.da}</p>
              <Pronunciation respelling={example.respelling} ipa={example.ipa} small />
              <p lang="en" {...stylex.props(ui.hint)}>{example.en}</p>
              <p {...stylex.props(ui.hint)}>{example.tip}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
