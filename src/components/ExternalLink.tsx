import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { ui } from '../styles/ui'

/** Every link that leaves the site: a new tab, so the app's state stays, and a hidden note for screen readers. */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...stylex.props(ui.focusable, ui.textLink)}>
      {children}{' '}
      <span {...stylex.props(ui.hidden)}>(opens in a new tab)</span>
    </a>
  )
}
