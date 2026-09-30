import * as stylex from '@stylexjs/stylex'
import { Link, useNavigate } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { APP_NAME } from '../constants'
import { usePage } from '../pageHooks'
import { space } from '../styles/tokens.stylex'
import { buttonProps, ui } from '../styles/ui'
import { NO_INPUT, useWebMcp } from '../webmcp/helper'

const styles = stylex.create({ action: { marginTop: space.s24 } })

export function NotFound() {
  const navigate = useNavigate()
  usePage('not-found', `Not found · ${APP_NAME}.`)
  useWebMcp([
    {
      name: 'go_to_street',
      description: 'Goes back to your street and returns the page it opened.',
      inputSchema: NO_INPUT,
      run: () => {
        navigate('/')
        return { ok: true, page: 'home' }
      },
    },
  ])
  return (
    <div {...stylex.props(ui.shell)}>
      <TopBar nav />
      <main {...stylex.props(ui.content)}>
        <h1 tabIndex={-1} {...stylex.props(ui.h1)}>That page doesn&apos;t exist.</h1>
        <div {...stylex.props(styles.action)}>
          <Link to="/" {...buttonProps('primary')}>Back to your street</Link>
        </div>
      </main>
    </div>
  )
}
