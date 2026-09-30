import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLesson, type Entry, type Lesson as LessonData } from '../catalog'
import { Lamp } from '../components/Lamp'
import { Recorder } from '../components/Recorder'
import { Specimen } from '../components/Specimen'
import { APP_NAME } from '../constants'
import { usePage } from '../pageHooks'
import { useRecorder } from '../recorder/useRecorder'
import { useSpeech, type HearResult } from '../speech/useSpeech'
import { useProgress } from '../storage/hooks'
import { lightEntry, litIds, progressStore } from '../storage/stores'
import { colors, fonts, radii, space } from '../styles/tokens.stylex'
import { buttonProps, ui } from '../styles/ui'
import { useWebMcp } from '../webmcp/helper'
import { lessonTools } from '../webmcp/lessonTools'
import { NotFound } from './NotFound'

const styles = stylex.create({
  bar: {
    position: 'relative',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    paddingInline: space.s20,
  },
  chip: {
    position: 'absolute',
    left: space.s20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: radii.round,
    backgroundColor: colors.paper,
    color: colors.ink,
    textDecoration: 'none',
    fontSize: 26,
  },
  barLabel: { fontSize: 15, fontWeight: 600, color: colors.inkSoft },
  english: {
    backgroundColor: colors.paper,
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    paddingTop: 34,
    paddingBottom: 20,
    paddingInline: 22,
  },
  meaning: { margin: 0, fontFamily: fonts.display, fontSize: 26, lineHeight: 1.15, fontWeight: 600, letterSpacing: '-0.01em' },
  note: { margin: 0, marginTop: space.s8 },
  actions: { display: 'flex', flexDirection: 'column', gap: space.s12, alignItems: 'stretch' },
  footer: { display: 'flex', gap: space.s12, marginTop: space.s20 },
  grow: { flexGrow: 1 },
})

/** Validates the address first, so the entry page itself only ever sees a real entry. */
export function LessonRoute() {
  const { lessonId, position } = useParams()
  const lesson = getLesson(lessonId)
  const n = position !== undefined && /^\d+$/.test(position) ? Number(position) : 0
  if (!lesson || n < 1 || n > lesson.entries.length) return <NotFound />
  return <LessonEntry key={`${lesson.id}/${n}`} lesson={lesson} position={n} />
}

function LessonEntry({ lesson, position }: { lesson: LessonData; position: number }) {
  const entry: Entry = lesson.entries[position - 1]
  const total = lesson.entries.length
  const navigate = useNavigate()
  const progress = useProgress()
  const speech = useSpeech(entry.da)
  const recorder = useRecorder(speech.stop)
  const recording = recorder.phase === 'recording'
  const [announcement, setAnnouncement] = useState('')
  const lit = litIds(progress, lesson.id).includes(entry.id)
  usePage('lesson', `${entry.da} · ${lesson.title} · ${APP_NAME}.`)

  // The "I said it" handler: the button and the mark_said tool both come here.
  const said = () => {
    if (litIds(progressStore.get(), lesson.id).includes(entry.id)) return
    lightEntry(lesson.id, entry.id)
    const count = litIds(progressStore.get(), lesson.id).length
    setAnnouncement(`Window lit. ${count} of ${total} lit.`)
  }

  // The play button and the hear_entry tool both come here. The Danish never enters a take, and it stops the take's playback.
  const hear = async (): Promise<HearResult> => {
    if (recording) return { ok: false, started: false, reason: 'recording' }
    recorder.stopPlayback()
    return speech.press()
  }

  useWebMcp(
    lessonTools({
      lesson,
      position,
      voice: speech.voice,
      status: speech.status,
      recording: recorder.phase === 'idle' ? 'none' : recorder.phase,
      hear,
      said,
      go: (to) => navigate(to),
    }),
  )

  const isLast = position === total
  const next = lesson.entries[position]
  return (
    <div {...stylex.props(ui.shell)}>
      <div {...stylex.props(styles.bar)}>
        <Link to="/" aria-label="Back to your street" {...stylex.props(ui.focusable, styles.chip)}>
          <span aria-hidden="true">‹</span>
        </Link>
        <span {...stylex.props(styles.barLabel)}>
          <span lang="da">{lesson.title}</span>{` · ${position} of ${total}`}
        </span>
      </div>
      <main {...stylex.props(ui.contentFocused)}>
        <Specimen
          entry={entry}
          color={lesson.color}
          speech={speech}
          onHear={hear}
          recordable={recorder.phase !== 'unsupported'}
          hearOff={recording}
        />
        <div {...stylex.props(styles.english)}>
          <p lang="en" {...stylex.props(styles.meaning)}>{entry.en}</p>
          <p {...stylex.props(ui.body, styles.note)}>{entry.note}</p>
        </div>
        <Lamp lit={lit} />
        <Recorder recorder={recorder} />
        <div {...stylex.props(styles.actions)}>
          <button
            type="button"
            aria-pressed={lit}
            onClick={said}
            {...buttonProps('primary')}
          >
            {lit ? 'Said it ✓' : 'I said it'}
          </button>
          <p {...stylex.props(ui.hint)}>Say it out loud, then tap “I said it”.</p>
          <p role="status" {...stylex.props(ui.hidden)}>{announcement}</p>
        </div>
        <div {...stylex.props(styles.footer)}>
          {position === 1 ? (
            <button type="button" disabled aria-disabled="true" {...buttonProps('secondary', true)}>Back</button>
          ) : (
            <Link to={`/lesson/${lesson.id}/${position - 1}`} {...buttonProps('secondary')}>Back</Link>
          )}
          <Link
            to={isLast ? `/lesson/${lesson.id}/done` : `/lesson/${lesson.id}/${position + 1}`}
            {...stylex.props(ui.focusable, ui.button, ui.primary, styles.grow)}
          >
            {isLast ? 'Finish' : <>Next: <span lang="da">{next.da}</span></>}
          </Link>
        </div>
      </main>
    </div>
  )
}
