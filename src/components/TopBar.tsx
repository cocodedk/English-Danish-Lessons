import * as stylex from '@stylexjs/stylex'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../constants'
import { colors, fonts, space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'

export type NavItem = 'street' | 'me'

// One `<nav>`: a bottom bar on phone and tablet, and inside the top bar from 900 px.
const styles = stylex.create({
  header: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    width: '100%',
    maxWidth: { default: null, '@media (min-width: 600px)': 720 },
    marginInline: 'auto',
    paddingInline: { default: space.s20, '@media (min-width: 600px)': space.s32 },
  },
  wordmark: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 48,
    minWidth: 48,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: colors.ink,
    textDecoration: 'none',
  },
  stop: { color: colors.flag },
  nav: {
    position: { default: 'fixed', '@media (min-width: 900px)': 'static' },
    left: 0,
    right: 0,
    bottom: { default: 0, '@media (min-width: 900px)': 'auto' },
    zIndex: 1,
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: { default: 'space-around', '@media (min-width: 900px)': 'flex-end' },
    gap: { default: 0, '@media (min-width: 900px)': space.s8 },
    backgroundColor: { default: colors.paper, '@media (min-width: 900px)': 'transparent' },
    borderTopStyle: 'solid',
    borderTopWidth: { default: 1.5, '@media (min-width: 900px)': 0 },
    borderTopColor: colors.line,
    paddingTop: { default: 10, '@media (min-width: 900px)': 0 },
    paddingBottom: { default: 24, '@media (min-width: 900px)': 0 },
    paddingInline: { default: space.s16, '@media (min-width: 900px)': 0 },
  },
  item: {
    display: 'flex',
    flexDirection: { default: 'column', '@media (min-width: 900px)': 'row' },
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: { default: 1, '@media (min-width: 900px)': 0 },
    minWidth: 48,
    minHeight: 48,
    paddingInline: { default: 0, '@media (min-width: 900px)': space.s16 },
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    color: colors.inkSoft,
  },
  current: {
    color: colors.ink,
    textDecoration: { default: 'none', '@media (min-width: 900px)': 'underline' },
  },
  pip: {
    display: { default: 'block', '@media (min-width: 900px)': 'none' },
    width: 22,
    height: 6,
    marginBottom: 4,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  pipOn: { backgroundColor: colors.lamp },
})

function NavLink({ to, label, current }: { to: string; label: string; current: boolean }) {
  return (
    <Link
      to={to}
      aria-current={current ? 'page' : undefined}
      {...stylex.props(ui.focusable, styles.item, current && styles.current)}
    >
      <span aria-hidden="true" {...stylex.props(styles.pip, current && styles.pipOn)} />
      {label}
    </Link>
  )
}

/** The wordmark, and the main nav when `nav` is set. `current` is left out on Not found. */
export function TopBar({ nav = false, current }: { nav?: boolean; current?: NavItem }) {
  return (
    <header {...stylex.props(styles.header)}>
      <Link to="/" {...stylex.props(ui.focusable, styles.wordmark)}>
        {APP_NAME}
        <span {...stylex.props(styles.stop)}>.</span>
      </Link>
      {nav && (
        <nav aria-label="Main" {...stylex.props(styles.nav)}>
          <NavLink to="/" label="Street" current={current === 'street'} />
          <NavLink to="/me" label="Me" current={current === 'me'} />
        </nav>
      )}
    </header>
  )
}
