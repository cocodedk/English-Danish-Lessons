import { act, screen } from '@testing-library/react'
import { sounds } from '../catalog/sounds'
import { call } from '../test/mcpCalls'
import { renderAt } from '../test/render'
import { installSpeech, voice } from '../test/speech'
import { installModelContext } from '../test/webmcp'

const soundIds = ['vowels', 'soft-d', 'r', 'stoed']

describe('webmcp on the Sounds page', () => {
  it('registers get_sounds and hear_example on #/sounds only, and describe says sounds', async () => {
    const reg = installModelContext()
    const view = renderAt('/sounds')
    expect(reg.names()).toEqual(['describe', 'get_sounds', 'hear_example'])
    expect(await call(reg, 'describe')).toEqual({
      page: 'sounds',
      summary: 'Four cards about Danish sounds, each with three example words to hear.',
      tools: ['describe', 'get_sounds', 'hear_example'],
    })
    expect(reg.tools.get('get_sounds')?.annotations).toEqual({ readOnlyHint: true })
    view.unmount()
    renderAt('/me')
    expect(reg.names()).not.toContain('get_sounds')
    expect(reg.names()).not.toContain('hear_example')
  })

  it('answers get_sounds with the cards and the voice state', async () => {
    const reg = installModelContext()
    const first = renderAt('/sounds')
    const answer = await call(reg, 'get_sounds')
    expect(answer.voice).toBe('unsupported')
    expect(answer.sounds).toEqual(
      sounds.map((s) => ({
        id: s.id,
        mark: s.mark,
        title: s.title,
        examples: s.examples.map(({ id, da, en, respelling, ipa }) => ({ id, da, en, respelling, ipa })),
      })),
    )
    first.unmount()
    for (const [voices, expected] of [
      [[], 'unknown'],
      [[voice('da-DK')], 'available'],
      [[voice('en-US')], 'none'],
    ] as const) {
      installSpeech([...voices])
      const view = renderAt('/sounds')
      expect((await call(reg, 'get_sounds')).voice).toBe(expected)
      view.unmount()
    }
  })

  it('speaks from hear_example as the play button does, and stops on a second call', async () => {
    const synth = installSpeech([voice('da-DK')])
    const reg = installModelContext()
    renderAt('/sounds')
    expect(await call(reg, 'hear_example', { soundId: 'r', exampleId: 'bror' })).toEqual({ ok: true, started: true })
    expect(synth.spoken[0].text).toBe('Bror')
    expect(synth.spoken[0].rate).toBe(0.85)
    expect(await call(reg, 'hear_example', { soundId: 'r', exampleId: 'bror' })).toEqual({ ok: true, started: false })
    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(await call(reg, 'hear_example', { soundId: 'stoed', exampleId: 'hund', extra: 1 })).toEqual({ ok: true, started: true })
    expect(synth.spoken[1].text).toBe('Hund')
  })

  it('stops on a second hear_example made before the page re-renders', async () => {
    const synth = installSpeech([voice('da-DK')])
    const reg = installModelContext()
    renderAt('/sounds')
    const input = { soundId: 'soft-d', exampleId: 'mad' }
    const answers: unknown[] = []
    await act(async () => {
      answers.push(await reg.call('hear_example', input), await reg.call('hear_example', input))
    })
    expect(answers).toEqual([{ ok: true, started: true }, { ok: true, started: false }])
    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'Stop' })).toBeNull()
  })

  it('refuses bad ids, wrong types, [] and other junk with the valid ids, and never throws', async () => {
    const reg = installModelContext()
    renderAt('/sounds')
    for (const input of [{}, { soundId: 5, exampleId: 'mad' }, { soundId: 'nope', exampleId: 'mad' }, [], 'x', null, 7]) {
      expect(await call(reg, 'hear_example', input), JSON.stringify(input)).toEqual({
        ok: false,
        error: expect.any(String),
        soundIds,
      })
    }
    for (const input of [{ soundId: 'soft-d' }, { soundId: 'soft-d', exampleId: 5 }, { soundId: 'soft-d', exampleId: 'tre' }]) {
      expect(await call(reg, 'hear_example', input), JSON.stringify(input)).toEqual({
        ok: false,
        error: expect.any(String),
        exampleIds: ['mad', 'roed', 'gade'],
      })
    }
    expect(await call(reg, 'hear_example', { soundId: 'soft-d', exampleId: 'mad' })).toEqual({
      ok: false,
      started: false,
      reason: 'unsupported',
    })
    const normal = await call(reg, 'get_sounds')
    for (const input of [[], { extra: 1 }, 'x', null]) expect(await call(reg, 'get_sounds', input)).toEqual(normal)
  })
})
