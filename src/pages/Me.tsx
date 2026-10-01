import * as stylex from '@stylexjs/stylex'
import { useEffect, useRef, useState } from 'react'
import { totalEntries } from '../catalog'
import { SiteFooter } from '../components/SiteFooter'
import { StorageNote } from '../components/StorageNote'
import { TopBar } from '../components/TopBar'
import { APP_NAME } from '../constants'
import { usePage } from '../pageHooks'
import { isPersistent } from '../storage/core'
import { usePrefs, useProfile, useProgress } from '../storage/hooks'
import {
  clearName,
  clearProgress,
  countLit,
  setColorMode,
  setName,
  validateName,
  type ColorMode,
} from '../storage/stores'
import { space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'
import { useWebMcp } from '../webmcp/helper'
import { meTools } from '../webmcp/meTools'
import { ColourSection, NameSection, PrivacySection, ProgressSection } from './MeSections'

const styles = stylex.create({ stack: { display: 'flex', flexDirection: 'column', gap: space.s32 } })

export function Me() {
  const { name: saved } = useProfile()
  const { colorMode } = usePrefs()
  const progress = useProgress()
  const [input, setInput] = useState(saved)
  const [nameMessage, setNameMessage] = useState('')
  const [progressMessage, setProgressMessage] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  usePage('me', `Me · ${APP_NAME}.`)
  useEffect(() => setInput(saved), [saved])

  const later = () => (isPersistent() ? '.' : ' for now.')
  const check = validateName(input)
  const canSave = check.ok && check.name !== saved

  const saveName = (raw: string) => {
    const result = validateName(raw)
    if (result.ok) {
      setName(result.name)
      setNameMessage(`Name saved${later()}`)
    }
    return result
  }
  const removeName = () => {
    clearName()
    setInput('')
    setNameMessage(`Name removed${later()}`)
  }
  const applyColorMode = (mode: ColorMode) => setColorMode(mode)
  const confirmDelete = () => {
    dialogRef.current?.close()
    clearProgress()
    setProgressMessage('Progress deleted.')
    headingRef.current?.focus()
  }

  useWebMcp(meTools({ saveName, removeName, applyColorMode, confirmDelete }))

  return (
    <div {...stylex.props(ui.shell)}>
      <TopBar nav current="me" />
      <main {...stylex.props(ui.content)}>
        <h1 tabIndex={-1} {...stylex.props(ui.h1)}>Me</h1>
        <StorageNote />
        <div {...stylex.props(styles.stack)}>
          <NameSection
            input={input}
            saved={saved}
            error={check.ok ? null : check.error}
            canSave={canSave}
            message={nameMessage}
            onInput={setInput}
            onSave={() => saveName(input)}
            onRemove={removeName}
          />
          <ColourSection mode={colorMode} onChange={applyColorMode} />
          <ProgressSection
            lit={countLit(progress)}
            total={totalEntries()}
            message={progressMessage}
            headingRef={headingRef}
            dialogRef={dialogRef}
            onDelete={confirmDelete}
          />
          <PrivacySection />
        </div>
        <SiteFooter />
      </main>
    </div>
  )
}
