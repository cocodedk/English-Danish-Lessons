import * as stylex from '@stylexjs/stylex'
import { Link } from 'react-router-dom'
import { COCODE } from '../links'
import { colors, space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'
import { ExternalLink } from './ExternalLink'

const styles = stylex.create({
  footer: {
    marginTop: space.s32,
    marginBottom: space.s24,
    fontSize: 15,
    lineHeight: 1.4,
    textAlign: 'center',
    color: colors.inkSoft,
  },
})

/** The maker line at the end of a main page's content. The About page leaves its own link out. */
export function SiteFooter({ about = true }: { about?: boolean }) {
  return (
    <footer {...stylex.props(styles.footer)}>
      Made by Babak at <ExternalLink href={COCODE}>cocode.dk</ExternalLink>
      {about && (
        <>
          {' · '}
          <Link to="/about" {...stylex.props(ui.focusable, ui.textLink)}>About</Link>
        </>
      )}
    </footer>
  )
}
