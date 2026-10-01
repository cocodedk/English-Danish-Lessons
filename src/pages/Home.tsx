import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { lessons, totalEntries } from '../catalog'
import { Pronunciation } from '../components/Pronunciation'
import { Skyline } from '../components/Skyline'
import { SiteFooter } from '../components/SiteFooter'
import { StorageNote } from '../components/StorageNote'
import { TopBar } from '../components/TopBar'
import { wordSize } from '../components/wordSize'
import { HOME_TITLE, usePage } from '../pageHooks'
import { useProfile, useProgress } from '../storage/hooks'
import { countLit, firstUnlit, litIds } from '../storage/stores'
import { fonts, space } from '../styles/tokens.stylex'
import { buttonProps, ui } from '../styles/ui'
import { homeTools } from '../webmcp/homeTools'
import { useWebMcp } from '../webmcp/helper'

const styles = stylex.create({
  section: { marginTop: space.s24 },
  cardTop: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: space.s12 },
  word: (fontSize: number) => ({
    margin: 0,
    fontFamily: fonts.display,
    fontSize,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    maxWidth: '100%',
    overflowWrap: 'break-word',
  }),
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

  const first = lessons[0]
  // The subject lesson is the first one with an unlit entry.
  const subject = lessons.find((l) => firstUnlit(progress, l.id))
  const unlit = subject && firstUnlit(progress, subject.id)
  const started = subject !== undefined && litIds(progress, subject.id).length > 0

  return (
    <div {...stylex.props(ui.shell)}>
      <TopBar nav current="street" />
      <main {...stylex.props(ui.content)}>
        <h1 tabIndex={-1} {...stylex.props(ui.h1)}>{name === '' ? 'Hej.' : `Hej, ${name}.`}</h1>
        <p {...stylex.props(ui.body)}>{windowsLine(countLit(progress), totalEntries(), first.title)}</p>
        <StorageNote />
        <div {...stylex.props(styles.section)}>
          <Skyline lessons={lessons} progress={progress} />
        </div>
        <section aria-label="Continue" {...stylex.props(ui.card, styles.section)}>
          {subject && unlit ? (
            <>
              <p {...stylex.props(styles.label)}>
                {started ? 'Next in ' : 'Start '}<span lang="da">{subject.title}</span>
              </p>
              <div {...stylex.props(styles.cardTop)}>
                <p lang="da" {...stylex.props(styles.word(wordSize(unlit.entry.da).card))}>{unlit.entry.da}</p>
                <Link to={`/lesson/${subject.id}/${unlit.position}`} {...buttonProps('primary')}>
                  {started ? 'Continue' : 'Start'}
                </Link>
              </div>
              <Pronunciation respelling={unlit.entry.respelling} ipa={unlit.entry.ipa} small />
              <p {...stylex.props(ui.body, styles.english)} lang="en">{unlit.entry.en}</p>
            </>
          ) : (
            <>
              <p {...stylex.props(styles.label)}>Every lesson is done</p>
              <div {...stylex.props(styles.cardTop)}>
                <p lang="da" {...stylex.props(styles.word(wordSize(first.title).card))}>{first.title}</p>
                <Link to={`/lesson/${first.id}/1`} {...buttonProps('primary')}>Practise</Link>
              </div>
              <p {...stylex.props(ui.body, styles.english)}>Start again from the beginning.</p>
            </>
          )}
        </section>
        {name === '' && (
          <Link to="/me" {...stylex.props(ui.focusable, ui.link, styles.addName)}>Add your name</Link>
        )}
        <SiteFooter />
      </main>
    </div>
  )
}
