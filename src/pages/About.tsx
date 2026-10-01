import * as stylex from '@stylexjs/stylex'
import { SiteFooter } from '../components/SiteFooter'
import { TopBar } from '../components/TopBar'
import { APP_NAME } from '../constants'
import { usePage } from '../pageHooks'
import { space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'
import { aboutTools } from '../webmcp/aboutTools'
import { useWebMcp } from '../webmcp/helper'
import { AboutCards } from './AboutCards'

const styles = stylex.create({ stack: { display: 'flex', flexDirection: 'column', gap: space.s24, marginTop: space.s24 } })

export function About() {
  usePage('about', `About · ${APP_NAME}.`)
  useWebMcp(aboutTools)
  return (
    <div {...stylex.props(ui.shell)}>
      <TopBar nav />
      <main {...stylex.props(ui.content)}>
        <h1 tabIndex={-1} {...stylex.props(ui.h1)}>About {APP_NAME}.</h1>
        <div {...stylex.props(styles.stack)}>
          <AboutCards />
        </div>
        <SiteFooter about={false} />
      </main>
    </div>
  )
}
