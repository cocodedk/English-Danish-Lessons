import * as stylex from '@stylexjs/stylex'
import { useRef, type RefObject } from 'react'
import { COLOR_MODES, type ColorMode } from '../storage/stores'
import { colors, fonts, radii, space } from '../styles/tokens.stylex'
import { buttonProps, ui } from '../styles/ui'

const styles = stylex.create({
  card: { display: 'flex', flexDirection: 'column', gap: space.s12, alignItems: 'flex-start', textAlign: 'left' },
  input: {
    boxSizing: 'border-box',
    width: '100%',
    height: 52,
    paddingInline: space.s16,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: colors.edge,
    borderRadius: radii.pill,
    backgroundColor: colors.sky,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 17,
  },
  label: { fontSize: 17, fontWeight: 700 },
  error: { margin: 0, fontSize: 15, fontWeight: 600, color: colors.ink },
  segmented: { display: 'flex', borderWidth: 0, padding: 0, margin: 0, gap: space.s8, flexWrap: 'wrap' },
  legend: { padding: 0, marginBottom: space.s8, fontSize: 17, fontWeight: 700 },
  option: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    minWidth: 72,
    minHeight: 48,
    paddingInline: space.s20,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: colors.edge,
    borderRadius: radii.pill,
    color: colors.ink,
    fontWeight: 600,
    cursor: 'pointer',
    outlineStyle: { default: 'none', ':focus-within': 'solid' },
    outlineWidth: 3,
    outlineColor: colors.fjord,
    outlineOffset: 3,
  },
  optionOn: { backgroundColor: colors.fjord, borderColor: colors.fjord, color: colors.onFjord, fontWeight: 700 },
  radio: { position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', margin: 0, cursor: 'pointer' },
  dialog: {
    boxSizing: 'border-box',
    maxWidth: 420,
    width: 'calc(100% - 40px)',
    borderWidth: 0,
    borderRadius: radii.card,
    padding: space.s24,
    backgroundColor: colors.paper,
    color: colors.ink,
  },
})

const CHOICES: Record<ColorMode, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' }

type NameProps = {
  input: string
  saved: string
  error: string | null
  canSave: boolean
  message: string
  onInput: (value: string) => void
  onSave: () => void
  onRemove: () => void
}

export function NameSection({ input, saved, error, canSave, message, onInput, onSave, onRemove }: NameProps) {
  return (
    <section aria-labelledby="me-name" {...stylex.props(ui.card, styles.card)}>
      <h2 id="me-name" {...stylex.props(ui.h2)}>Your name</h2>
      <label htmlFor="me-name-input" {...stylex.props(styles.label)}>Name</label>
      <input
        id="me-name-input"
        type="text"
        value={input}
        autoComplete="off"
        aria-describedby={error ? 'me-name-hint me-name-error' : 'me-name-hint'}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onInput(e.target.value)}
        {...stylex.props(ui.focusable, styles.input)}
      />
      <p id="me-name-hint" {...stylex.props(ui.hint)}>Optional. Used for your greeting. It stays in this browser.</p>
      {error && <p id="me-name-error" {...stylex.props(styles.error)}>{error}</p>}
      <div {...stylex.props(ui.row)}>
        <button type="button" disabled={!canSave} aria-disabled={!canSave} onClick={onSave} {...buttonProps('primary', !canSave)}>
          Save name
        </button>
        {saved !== '' && (
          <button type="button" onClick={onRemove} {...buttonProps('secondary')}>Remove name</button>
        )}
      </div>
      <p role="status" {...stylex.props(ui.hint)}>{message}</p>
    </section>
  )
}

export function ColourSection({ mode, onChange }: { mode: ColorMode; onChange: (mode: ColorMode) => void }) {
  return (
    <section aria-labelledby="me-colours" {...stylex.props(ui.card, styles.card)}>
      <h2 id="me-colours" {...stylex.props(ui.h2)}>Colours</h2>
      <fieldset {...stylex.props(styles.segmented)}>
        <legend {...stylex.props(styles.legend)}>Colour mode</legend>
        {COLOR_MODES.map((m) => (
          <label key={m} {...stylex.props(styles.option, mode === m && styles.optionOn)}>
            <input
              type="radio"
              name="colour-mode"
              value={m}
              checked={mode === m}
              onChange={() => onChange(m)}
              {...stylex.props(styles.radio)}
            />
            {CHOICES[m]}
          </label>
        ))}
      </fieldset>
      <p {...stylex.props(ui.hint)}>Auto follows your phone or computer.</p>
    </section>
  )
}

type ProgressProps = {
  lit: number
  total: number
  message: string
  headingRef: RefObject<HTMLHeadingElement | null>
  dialogRef: RefObject<HTMLDialogElement | null>
  onDelete: () => void
}

export function ProgressSection({ lit, total, message, headingRef, dialogRef, onDelete }: ProgressProps) {
  const opener = useRef<HTMLButtonElement>(null)
  const keep = useRef<HTMLButtonElement>(null)
  const open = () => {
    dialogRef.current?.showModal()
    keep.current?.focus()
  }
  const close = () => {
    dialogRef.current?.close()
    opener.current?.focus()
  }
  return (
    <section aria-labelledby="me-progress" {...stylex.props(ui.card, styles.card)}>
      <h2 id="me-progress" ref={headingRef} tabIndex={-1} {...stylex.props(ui.h2)}>Your progress</h2>
      <p {...stylex.props(ui.body)}>{lit === 0 ? 'No windows lit yet.' : `${lit} of ${total} windows lit.`}</p>
      {lit > 0 && (
        <>
          <button type="button" ref={opener} onClick={open} {...buttonProps('secondary')}>Delete progress</button>
          <dialog
            ref={dialogRef}
            aria-labelledby="me-delete-title"
            onCancel={(e) => {
              e.preventDefault()
              close()
            }}
            {...stylex.props(styles.dialog)}
          >
            <h2 id="me-delete-title" {...stylex.props(ui.h2)}>Delete your progress?</h2>
            <p {...stylex.props(ui.body)}>Every lit window on your street goes dark. You can&apos;t undo this.</p>
            <div {...stylex.props(ui.row)}>
              <button type="button" onClick={onDelete} {...buttonProps('primary')}>Delete progress</button>
              <button type="button" ref={keep} onClick={close} {...buttonProps('secondary')}>Keep it</button>
            </div>
          </dialog>
        </>
      )}
      <p role="status" {...stylex.props(ui.hint)}>{message}</p>
    </section>
  )
}

export function PrivacySection() {
  return (
    <section aria-labelledby="me-privacy" {...stylex.props(ui.card, styles.card)}>
      <h2 id="me-privacy" {...stylex.props(ui.h2)}>Privacy</h2>
      <p {...stylex.props(ui.body)}>
        Hej saves your name, your progress and your colour choice in this browser only. Nothing is sent anywhere, and there are no accounts.
      </p>
    </section>
  )
}
