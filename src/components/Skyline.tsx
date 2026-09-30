import * as stylex from '@stylexjs/stylex'
import { Link } from 'react-router-dom'
import { PLANNED_LESSONS, type Lesson } from '../catalog'
import { litIds, type Progress } from '../storage/stores'
import { colors, space } from '../styles/tokens.stylex'
import { ui } from '../styles/ui'
import { House, houseHeight } from './House'

const HOUSE_WIDTH = 96

const styles = stylex.create({
  scroller: { overflowX: 'auto', scrollbarWidth: 'none', scrollSnapType: 'x proximity' },
  // At least as wide as the screen and as wide as every house: the strips run the whole street.
  street: { width: 'max-content', minWidth: '100%' },
  row: {
    display: 'flex',
    alignItems: 'flex-end',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    boxSizing: 'border-box',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    width: HOUSE_WIDTH + 6,
    paddingInline: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    textAlign: 'center',
  },
  link: {
    display: 'flex',
    justifyContent: 'center',
    textDecoration: 'none',
    color: colors.ink,
  },
  ground: { height: 6, backgroundColor: colors.ground },
  water: { height: 18, backgroundImage: 'linear-gradient(var(--line), transparent)' },
  title: { fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginTop: space.s8 },
  count: { fontSize: 13, lineHeight: 1.3, color: colors.inkSoft },
  plot: {
    boxSizing: 'border-box',
    width: HOUSE_WIDTH,
    marginInline: 'auto',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 0,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  caption: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: space.s8,
  },
})

export function houseLabel(lesson: Lesson, lit: number): string {
  return `${lesson.title}, ${lit} of ${lesson.entries.length} windows lit`
}

/** The lesson houses in one row on one ground line, then the empty plot for the next one. */
export function Skyline({ lessons, progress }: { lessons: readonly Lesson[]; progress: Progress }) {
  const lit = (lesson: Lesson) => {
    const ids = litIds(progress, lesson.id)
    return new Set(lesson.entries.flatMap((e, i) => (ids.includes(e.id) ? [i] : [])))
  }
  const showPlot = lessons.length < PLANNED_LESSONS
  return (
    <section aria-labelledby="street-caption">
      <div {...stylex.props(styles.caption, ui.caption)}>
        <span id="street-caption">Your street</span>
        <span>{lessons.length === 1 ? '1 lesson' : `${lessons.length} lessons`}</span>
      </div>
      <div {...stylex.props(styles.scroller)}>
        <div {...stylex.props(styles.street)}>
          <ul {...stylex.props(styles.row)}>
            {lessons.map((lesson) => {
              const windows = lit(lesson)
              return (
                <li key={lesson.id} {...stylex.props(styles.item)}>
                  <Link
                    to={`/lesson/${lesson.id}`}
                    aria-label={houseLabel(lesson, windows.size)}
                    {...stylex.props(ui.focusable, styles.link)}
                  >
                    <House
                      color={lesson.color}
                      gable={lesson.gable}
                      entryCount={lesson.entries.length}
                      lit={windows}
                      width={HOUSE_WIDTH}
                    />
                  </Link>
                </li>
              )
            })}
            {showPlot && (
              <li aria-hidden="true" {...stylex.props(styles.item)}>
                <div data-plot {...stylex.props(styles.plot)} style={{ height: houseHeight(lessons[lessons.length - 1].entries.length) }} />
              </li>
            )}
          </ul>
          <div aria-hidden="true" {...stylex.props(styles.ground)} />
          <div aria-hidden="true" {...stylex.props(styles.water)} />
          <ul {...stylex.props(styles.row)}>
            {lessons.map((lesson) => (
              <li key={lesson.id} {...stylex.props(styles.item)}>
                <span lang="da" {...stylex.props(styles.title)}>{lesson.title}</span>
                <span aria-hidden="true" {...stylex.props(styles.count)}>
                  {lit(lesson).size} of {lesson.entries.length}
                </span>
              </li>
            ))}
            {showPlot && (
              <li {...stylex.props(styles.item)}>
                <span {...stylex.props(styles.count, styles.title)}>Coming next</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
