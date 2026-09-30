import * as stylex from '@stylexjs/stylex'
import { usePersistent } from '../storage/hooks'
import { space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'

const styles = stylex.create({ note: { marginBlock: space.s16 } })

export const STORAGE_NOTE =
  "This browser can't save your progress, name or colour choice. They will be lost when you reload or close the page."

/** A fact about the page, not an interruption: it shows whenever storage is not saving and cannot be dismissed. */
export function StorageNote() {
  if (usePersistent()) return null
  return (
    <p role="status" {...stylex.props(ui.card, ui.body, styles.note)}>
      {STORAGE_NOTE}
    </p>
  )
}
