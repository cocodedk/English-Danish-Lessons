import { getLesson, lessons, totalEntries } from '../catalog'
import { countLit,firstUnlit, litIds, profileStore, progressStore } from '../storage/stores'
import { isPersistent } from '../storage/core'
import { fail, NO_INPUT, type Tool } from './helper'

export function streetAnswer() {
  const progress = progressStore.get()
  const name = profileStore.get().name
  let next: { lessonId: string; position: number; da: string; en: string } | null = null
  for (const lesson of lessons) {
    const unlit = firstUnlit(progress, lesson.id)
    if (unlit) {
      next = { lessonId: lesson.id, position: unlit.position, da: unlit.entry.da, en: unlit.entry.en }
      break
    }
  }
  return {
    name: name === '' ? null : name,
    windowsLit: countLit(progress),
    windowsTotal: totalEntries(),
    storage: isPersistent() ? 'saved' : 'session-only',
    lessons: lessons.map((l) => {
      const lit = litIds(progress, l.id).length
      return { id: l.id, title: l.title, titleEn: l.titleEn, lit, total: l.entries.length, done: lit === l.entries.length }
    }),
    next,
  }
}

/** `go` receives the route to open; the same navigation the street's links make. */
export function homeTools(go: (to: string) => void): Tool[] {
  return [
    {
      name: 'get_street',
      description: 'Returns the name, how many windows are lit, each lesson and the next entry to learn.',
      inputSchema: NO_INPUT,
      annotations: { readOnlyHint: true },
      run: streetAnswer,
    },
    {
      name: 'open_lesson',
      description: 'Opens a lesson entry page by lesson id and optional position, and returns where it went.',
      inputSchema: {
        type: 'object',
        properties: { lessonId: { type: 'string' }, position: { type: 'integer', minimum: 1 } },
        required: ['lessonId'],
      },
      run: ({ lessonId, position }) => {
        const lessonIds = lessons.map((l) => l.id)
        const lesson = typeof lessonId === 'string' ? getLesson(lessonId) : undefined
        if (!lesson) return fail('Use one of the lesson ids.', { lessonIds })
        let at = firstUnlit(progressStore.get(), lesson.id)?.position ?? 1
        if (position !== undefined) {
          if (typeof position !== 'number' || !Number.isInteger(position) || position < 1 || position > lesson.entries.length) {
            return fail(`Use a whole number from 1 to ${lesson.entries.length} for position.`, { lessonIds })
          }
          at = position
        }
        go(`/lesson/${lesson.id}/${at}`)
        return { ok: true, page: 'lesson', lessonId: lesson.id, position: at }
      },
    },
  ]
}
