import * as stylex from '@stylexjs/stylex'
import { colors, fonts, radii, space } from './tokens.stylex'

// Shared building blocks: page frame, type roles, buttons, cards.
// Breakpoints: tablet 600, desktop 900. Motion is instant under prefers-reduced-motion.
export const ui = stylex.create({
  shell: {
    minHeight: '100dvh',
    backgroundColor: colors.sky,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 1.45,
  },
  content: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: { default: null, '@media (min-width: 600px)': 720 },
    marginInline: 'auto',
    paddingInline: { default: space.s20, '@media (min-width: 600px)': space.s32 },
    paddingBottom: { default: 120, '@media (min-width: 900px)': space.s44 },
  },
  contentFocused: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: { default: null, '@media (min-width: 600px)': 560 },
    marginInline: 'auto',
    paddingInline: { default: space.s20, '@media (min-width: 600px)': space.s32 },
    paddingBottom: space.s44,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: { default: 44, '@media (min-width: 900px)': 56 },
    lineHeight: 1.02,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    overflowWrap: 'anywhere',
    color: colors.ink,
    marginTop: space.s16,
    marginBottom: space.s8,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: colors.ink,
    marginTop: 0,
    marginBottom: space.s12,
  },
  body: { fontSize: 17, lineHeight: 1.45, color: colors.ink, margin: 0 },
  hint: { fontSize: 15, lineHeight: 1.4, color: colors.inkSoft, margin: 0 },
  caption: { fontSize: 13, lineHeight: 1.3, color: colors.inkSoft },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.card,
    padding: space.s20,
  },
  focusable: {
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 3,
    outlineColor: colors.fjord,
    outlineOffset: 3,
  },
  link: {
    color: colors.fjord,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  button: {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    minWidth: 48,
    paddingInline: space.s24,
    borderStyle: 'solid',
    borderWidth: 0,
    borderRadius: radii.pill,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 1,
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    transform: { default: null, ':active': 'translateY(1px)' },
    transitionProperty: 'transform',
    transitionDuration: { default: '120ms', '@media (prefers-reduced-motion: reduce)': '0s' },
  },
  primary: { backgroundColor: colors.fjord, color: colors.onFjord },
  secondary: {
    backgroundColor: { default: 'transparent', ':hover': colors.paper },
    color: colors.ink,
    borderWidth: 2,
    borderColor: colors.edge,
  },
  disabled: { opacity: 0.55, cursor: 'default' },
  row: { display: 'flex', flexWrap: 'wrap', gap: space.s12, alignItems: 'center' },
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
})

export type ButtonKind = 'primary' | 'secondary'

/** Class props for a control that looks like a button (a `<button>` or a link). */
export function buttonProps(kind: ButtonKind, disabled = false) {
  return stylex.props(
    ui.focusable,
    ui.button,
    kind === 'primary' ? ui.primary : ui.secondary,
    disabled && ui.disabled,
  )
}
