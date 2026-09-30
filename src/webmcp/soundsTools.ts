import { sounds } from '../catalog/sounds'
import type { HearResult } from '../speech/useSpeech'
import { fail, NO_INPUT, type Tool } from './helper'

export type SoundsContext = {
  voice: 'available' | 'none' | 'unsupported' | 'unknown'
  /** The play button's handler for one example. */
  hear: (exampleId: string) => Promise<HearResult>
}

export function soundsTools(ctx: SoundsContext): Tool[] {
  return [
    {
      name: 'get_sounds',
      description: 'Returns the four sound cards with their example words and whether this device can speak Danish.',
      inputSchema: NO_INPUT,
      annotations: { readOnlyHint: true },
      run: () => ({
        voice: ctx.voice,
        sounds: sounds.map(({ id, mark, title, examples }) => ({
          id,
          mark,
          title,
          examples: examples.map(({ id: exampleId, da, en, respelling, ipa }) => ({ id: exampleId, da, en, respelling, ipa })),
        })),
      }),
    },
    {
      name: 'hear_example',
      description: 'Speaks one example word with a local Danish voice, or stops it, and returns whether it started.',
      inputSchema: {
        type: 'object',
        properties: { soundId: { type: 'string' }, exampleId: { type: 'string' } },
        required: ['soundId', 'exampleId'],
      },
      run: ({ soundId, exampleId }) => {
        const card = sounds.find((s) => s.id === soundId)
        if (!card) {
          return fail('Use the id of one of the sound cards.', { soundIds: sounds.map((s) => s.id) })
        }
        const example = card.examples.find((e) => e.id === exampleId)
        if (!example) {
          return fail('Use the id of one of the examples on that card.', { exampleIds: card.examples.map((e) => e.id) })
        }
        return ctx.hear(example.id)
      },
    },
  ]
}
