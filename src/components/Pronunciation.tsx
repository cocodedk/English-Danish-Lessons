import * as stylex from '@stylexjs/stylex'
import { fonts } from '../styles/tokens.stylex'

const styles = stylex.create({
  line: { margin: 0, fontSize: 19, lineHeight: 1.35, fontWeight: 400 },
  small: { fontSize: 17 },
  respelling: { fontWeight: 700 },
  ipa: { fontFamily: fonts.ipa, fontWeight: 400, whiteSpace: 'nowrap' },
})

/** `Sounds like “hi” · [ˈhɑj]`: both helps together, wrapping only at the dot. */
export function Pronunciation({ respelling, ipa, small = false }: { respelling: string; ipa: string; small?: boolean }) {
  return (
    <p {...stylex.props(styles.line, small && styles.small)}>
      Sounds like “<span {...stylex.props(styles.respelling)}>{respelling}</span>” ·{' '}
      <span {...stylex.props(styles.ipa)}>{ipa}</span>
    </p>
  )
}
