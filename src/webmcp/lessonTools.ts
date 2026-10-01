import type { Lesson } from '../catalog'
import type { RecordPhase } from '../recorder/machine'
import type { HearResult, SpeechStatus, ToolVoice } from '../speech/useSpeech'
import { countLit, litIds, progressStore } from '../storage/stores'
import { totalEntries } from '../catalog'
import { fail, NO_INPUT, type Tool } from './helper'

export type LessonContext = {
  lesson: Lesson
  position: number
  voice: ToolVoice
  status: SpeechStatus
  recording: 'none' | Exclude<RecordPhase, 'idle'>
  hear: () => Promise<HearResult>
  /** The "I said it" handler. */
  said: () => void
  go: (to: string) => void
}

export function lessonTools(ctx: LessonContext): Tool[] {
  const { lesson, position } = ctx
  const entry = lesson.entries[position - 1]
  const total = lesson.entries.length
  const isLit = () => litIds(progressStore.get(), lesson.id).includes(entry.id)
  return [
    {
      name: 'get_entry',
      description: "Returns the Danish entry on screen with its English, sound guide, note, whether its window is lit and the recorder's state.",
      inputSchema: NO_INPUT,
      annotations: { readOnlyHint: true },
      run: () => ({
        lessonId: lesson.id,
        position,
        total,
        da: entry.da,
        en: entry.en,
        respelling: entry.respelling,
        ipa: entry.ipa,
        note: entry.note,
        lit: isLit(),
        voice: ctx.voice,
        speaking: ctx.status !== 'idle',
        recording: ctx.recording,
      }),
    },
    {
      name: 'hear_entry',
      description: 'Speaks the Danish with a local Danish voice and returns whether it started.',
      inputSchema: NO_INPUT,
      run: () => ctx.hear(),
    },
    {
      name: 'mark_said',
      description: 'Lights this entry\'s window, as the "I said it" button does, and returns the lit count.',
      inputSchema: NO_INPUT,
      run: () => {
        ctx.said()
        return { ok: true, lit: true, windowsLit: countLit(progressStore.get()), windowsTotal: totalEntries() }
      },
    },
    {
      name: 'go_to',
      description: 'Goes back, to the next entry, or to the result after the last entry, and returns the new page.',
      inputSchema: {
        type: 'object',
        properties: { where: { type: 'string', enum: ['back', 'next', 'finish'] } },
        required: ['where'],
      },
      run: ({ where }) => {
        const valid = [...(position > 1 ? ['back'] : []), ...(position < total ? ['next'] : ['finish'])]
        if (typeof where !== 'string' || !valid.includes(where)) {
          return fail('Use one of the valid directions for this entry.', { valid })
        }
        if (where === 'finish') {
          ctx.go(`/lesson/${lesson.id}/done`)
          return { ok: true, page: 'done' }
        }
        const to = where === 'back' ? position - 1 : position + 1
        ctx.go(`/lesson/${lesson.id}/${to}`)
        return { ok: true, page: 'lesson', position: to }
      },
    },
  ]
}
