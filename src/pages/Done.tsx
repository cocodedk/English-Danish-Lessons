import * as stylex from '@stylexjs/stylex'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLesson, type Lesson } from '../catalog'
import { Bunting } from '../components/Bunting'
import { House } from '../components/House'
import { Pronunciation } from '../components/Pronunciation'
import { TopBar } from '../components/TopBar'
import { APP_NAME } from '../constants'
import { usePage } from '../pageHooks'
import { useProgress } from '../storage/hooks'
import { firstUnlit, litIds } from '../storage/stores'
import { colors, fonts, radii, space } from '../styles/tokens.stylex'
import { buttonProps, ui } from '../styles/ui'
import { doneTools } from '../webmcp/doneTools'
import { useWebMcp } from '../webmcp/helper'
import { NotFound } from './NotFound'

const styles = stylex.create({
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: space.s16 },
  praise: {
    margin: 0,
    fontFamily: fonts.display,
    fontSize: 'clamp(44px, 13vw, 64px)',
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: colors.ink,
  },
  welcome: { margin: 0, fontFamily: fonts.display, fontSize: 26, fontWeight: 700, lineHeight: 1.15 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 48,
    paddingInline: space.s20,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    fontSize: 15,
    fontWeight: 600,
  },
  actions: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: space.s12, width: '100%' },
})

function announcement(lit: number, total: number, praise: string): string {
  if (lit === total) return `All ${total} windows lit. ${praise}!`
  if (lit === 0) return 'No windows lit yet.'
  return `${lit} of ${total} windows lit. ${total - lit} left to light.`
}

/** Validates the lesson first, so the result page itself only ever sees a real lesson. */
export function DoneRoute() {
  const lesson = getLesson(useParams().lessonId)
  return lesson ? <Done lesson={lesson} /> : <NotFound />
}

function Done({ lesson }: { lesson: Lesson }) {
  const navigate = useNavigate()
  const progress = useProgress()
  const total = lesson.entries.length
  const ids = litIds(progress, lesson.id)
  const lit = ids.length
  const allLit = lit === total
  const first = firstUnlit(progress, lesson.id)
  const [message, setMessage] = useState('')
  usePage('done', `Done · ${lesson.title} · ${APP_NAME}.`)
  useWebMcp(doneTools(lesson, (to) => navigate(to)))
  // Announced once, when the page appears.
  useEffect(() => setMessage(announcement(lit, total, lesson.praise.da)), [])

  const house = (
    <House
      color={lesson.color}
      gable={lesson.gable}
      entryCount={total}
      lit={new Set(lesson.entries.flatMap((e, i) => (ids.includes(e.id) ? [i] : [])))}
      width={220}
    />
  )
  const street = (kind: 'primary' | 'secondary') => (
    <Link to="/" {...buttonProps(kind)}>Back to your street</Link>
  )

  return (
    <div {...stylex.props(ui.shell)}>
      {allLit && <Bunting />}
      <TopBar />
      <p role="status" {...stylex.props(ui.hidden)}>{message}</p>
      <main {...stylex.props(ui.contentFocused, styles.center)}>
        {allLit ? (
          <>
            <h1 tabIndex={-1} lang="da" {...stylex.props(styles.praise)}>{lesson.praise.da}</h1>
            <Pronunciation respelling={lesson.praise.respelling} ipa={lesson.praise.ipa} />
            <p lang="en" {...stylex.props(styles.welcome)}>{lesson.praise.en}</p>
            {house}
            <span {...stylex.props(styles.chip)}>
              <span lang="da">{lesson.title}</span>{` · all ${total} windows lit`}
            </span>
            <div {...stylex.props(styles.actions)}>
              {street('primary')}
              <Link to={`/lesson/${lesson.id}/1`} {...buttonProps('secondary')}>Practise again</Link>
            </div>
          </>
        ) : (
          <>
            <h1 tabIndex={-1} {...stylex.props(ui.h1)}>{`${lit} of ${total} windows lit`}</h1>
            <p {...stylex.props(ui.body)}>
              {lit === 0
                ? <>Start with <span lang="da">Hej</span> and light your first window.</>
                : 'Go back to the entries you skipped to light the rest.'}
            </p>
            {house}
            <div {...stylex.props(styles.actions)}>
              <Link to={`/lesson/${lesson.id}/${first?.position ?? 1}`} {...buttonProps('primary')}>
                {lit === 0 ? 'Start the lesson' : 'Light the rest'}
              </Link>
              {street('secondary')}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
