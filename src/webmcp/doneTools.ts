import type { Lesson } from '../catalog'
import { firstUnlit, litIds, progressStore } from '../storage/stores'
import { fail, NO_INPUT, type Tool } from './helper'

const VALID = ['street', 'practise', 'light_the_rest']

export function doneTools(lesson: Lesson, go: (to: string) => void): Tool[] {
  const total = lesson.entries.length
  return [
    {
      name: 'get_result',
      description: 'Returns how many windows of this lesson are lit and the praise word.',
      inputSchema: NO_INPUT,
      annotations: { readOnlyHint: true },
      run: () => {
        const lit = litIds(progressStore.get(), lesson.id).length
        return { lessonId: lesson.id, lit, total, allLit: lit === total, praise: { da: lesson.praise.da, en: lesson.praise.en } }
      },
    },
    {
      name: 'go_from_done',
      description: 'Leaves the result page for your street, for entry 1, or for the first unlit entry, and returns the page.',
      inputSchema: {
        type: 'object',
        properties: { where: { type: 'string', enum: VALID } },
        required: ['where'],
      },
      run: ({ where }) => {
        if (typeof where !== 'string' || !VALID.includes(where)) return fail('Use one of the valid places.', { valid: VALID })
        if (where === 'street') {
          go('/')
          return { ok: true, page: 'home' }
        }
        const position = where === 'practise' ? 1 : (firstUnlit(progressStore.get(), lesson.id)?.position ?? 1)
        go(`/lesson/${lesson.id}/${position}`)
        return { ok: true, page: 'lesson' }
      },
    },
  ]
}
