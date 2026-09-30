import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { lessons, totalEntries } from '../catalog'
import { Pronunciation } from '../components/Pronunciation'
import { Skyline } from '../components/Skyline'
import { StorageNote } from '../components/StorageNote'
import { TopBar } from '../components/TopBar'
import { HOME_TITLE, usePage } from '../pageHooks'
import { useProfile, useProgress } from '../storage/hooks'
import { countLit, firstUnlit } from '../storage/stores'
import { fonts, space } from '../styles/tokens.stylex'
import { buttonProps, ui } from '../styles/ui'
import { homeTools } from '../webmcp/homeTools'
import { useWebMcp } from '../webmcp/helper'

const styles = stylex.create({
  section: { marginTop: space.s24 },
  cardTop: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: space.s12 },
  word: {
    margin: 0,
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  label: { margin: 0, fontSize: 15, fontWeight: 600 },
  english: { margin: 0, marginTop: space.s4 },
  addName: { marginTop: space.s8 },
})

function windowsLine(lit: number, total: number, title: string): ReactNode {
  if (lit === 0) return <>Your street is waiting. Start with <span lang="da">{title}</span>.</>

  if (lit === total) return 'Every window is lit on your street.'
  return `${lit} ${lit === 1 ? 'window' : 'windows'} lit on your street.`
}

export function Home() {
  const navigate = useNavigate()
  const { name } = useProfile()
  const progress = useProgress()
  usePage('home', HOME_TITLE)
  useWebMcp(homeTools((to) => navigate(to)))

  const lit = countLit(progress)
  const total = totalEntries()
  const lesson = lessons[0]
  const unlit = firstUnlit(progress, lesson.id)

  return (
    <div {...stylex.props(ui.shell)}>
      <TopBar nav current="street" />
      <main {...stylex.props(ui.content)}>
        <h1 tabIndex={-1} {...stylex.props(ui.h1)}>{name === '' ? 'Hej.' : `Hej, ${name}.`}</h1>
        <p {...stylex.props(ui.body)}>{windowsLine(lit, total, lesson.title)}</p>
        <StorageNote />
        <div {...stylex.props(styles.section)}>
          <Skyline lessons={lessons} progress={progress} />
        </div>
        <section aria-label="Continue" {...stylex.props(ui.card, styles.section)}>
          {unlit ? (
            <>
              <p {...stylex.props(styles.label)}>
                {lit === 0 ? 'Start ' : 'Next in '}<span lang="da">{lesson.title}</span>
              </p>
              <div {...stylex.props(styles.cardTop)}>
                <p lang="da" {...stylex.props(styles.word)}>{unlit.entry.da}</p>
                <Link to={`/lesson/${lesson.id}/${unlit.position}`} {...buttonProps('primary')}>
                  {lit === 0 ? 'Start' : 'Continue'}
                </Link>
              </div>
              <Pronunciation respelling={unlit.entry.respelling} ipa={unlit.entry.ipa} small />
              <p {...stylex.props(ui.body, styles.english)} lang="en">{unlit.entry.en}</p>
            </>
          ) : (
            <>
              <p {...stylex.props(styles.label)}><span lang="da">{lesson.title}</span> is done</p>
              <div {...stylex.props(styles.cardTop)}>
                <p lang="da" {...stylex.props(styles.word)}>{lesson.title}</p>
                <Link to={`/lesson/${lesson.id}/1`} {...buttonProps('primary')}>Practise</Link>
              </div>
              <p {...stylex.props(ui.body, styles.english)}>Say it all again</p>
            </>
          )}
        </section>
        {name === '' && (
          <Link to="/me" {...stylex.props(ui.focusable, ui.link, styles.addName)}>Add your name</Link>
        )}
      </main>
    </div>
  )
}
