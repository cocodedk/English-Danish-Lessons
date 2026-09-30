import * as stylex from '@stylexjs/stylex'
import { colors } from '../styles/tokens.stylex'

/** A facade colour with its matching text colour, one style per lesson colour. */
export const facade = stylex.create({
  gul: { backgroundColor: colors.gul, color: colors.onGul },
  tegl: { backgroundColor: colors.tegl, color: colors.onTegl },
  hav: { backgroundColor: colors.hav, color: colors.onHav },
  salvie: { backgroundColor: colors.salvie, color: colors.onSalvie },
  rosa: { backgroundColor: colors.rosa, color: colors.onRosa },
})
