import { fireEvent, screen } from '@testing-library/react'
import { call, where } from '../test/mcpCalls'
import { renderAt } from '../test/render'
import { readText } from '../test/files'
import { installRecorder } from '../test/recorder'
import { installSpeech, voice } from '../test/speech'
import { installModelContext } from '../test/webmcp'

const PATH = '/lesson/hej-og-tak/1'
const button = (name: string) => screen.getByRole('button', { name })
const recording = async (reg: ReturnType<typeof installModelContext>) => (await call(reg, 'get_entry')).recording

describe('webmcp and the recorder', () => {
  it('reports the recorder state in get_entry, in every state', async () => {
    const reg = installModelContext()
    const first = renderAt(PATH)
    expect(await recording(reg)).toBe('unsupported')
    first.unmount()
    const mic = installRecorder()
    renderAt(PATH)
    expect(await recording(reg)).toBe('none')
    fireEvent.click(button('Record yourself'))
    expect(await recording(reg)).toBe('asking')
    await mic.grant()
    expect(await recording(reg)).toBe('recording')
    fireEvent.click(button('Stop'))
    expect(await recording(reg)).toBe('finishing')
    await mic.finish()
    expect(await recording(reg)).toBe('recorded')
    fireEvent.click(button('Record again'))
    await mic.refuse('NotAllowedError')
    expect(await recording(reg)).toBe('denied')
    fireEvent.click(button('Try again'))
    await mic.refuse('NotFoundError')
    expect(await recording(reg)).toBe('no-microphone')
    fireEvent.click(button('Try again'))
    await mic.refuse('AbortError')
    expect(await recording(reg)).toBe('failed')
  })

  it('has no tool named for recording, and no tool starts the microphone', async () => {
    const mic = installRecorder()
    const reg = installModelContext()
    renderAt(PATH)
    expect(reg.names()).toEqual(['describe', 'get_entry', 'go_to', 'hear_entry', 'mark_said'])
    expect(reg.names().filter((name) => /record|microphone|mic$|stop/.test(name))).toEqual([])
    for (const name of reg.names()) if (name !== 'go_to') await call(reg, name)
    expect(mic.getUserMedia).not.toHaveBeenCalled()
    expect(await recording(reg)).toBe('none')
  })

  it('answers hear_entry with reason recording while recording, and speaks nothing', async () => {
    const synth = installSpeech([voice('da-DK')])
    const mic = installRecorder()
    const reg = installModelContext()
    renderAt(PATH)
    fireEvent.click(button('Record yourself'))
    await mic.grant()
    expect(await call(reg, 'hear_entry')).toEqual({ ok: false, started: false, reason: 'recording' })
    expect(synth.speak).not.toHaveBeenCalled()
    fireEvent.click(button('Stop'))
    await mic.finish()
    expect(await call(reg, 'hear_entry')).toEqual({ ok: true, started: true })
  })

  it('stops and cleans up a recording when go_to leaves the entry', async () => {
    const mic = installRecorder()
    const reg = installModelContext()
    for (const [direction, path, to] of [['next', PATH, '/lesson/hej-og-tak/2'], ['back', '/lesson/hej-og-tak/2', PATH]]) {
      mic.tracks.forEach((track) => track.stop.mockClear())
      const view = renderAt(path)
      fireEvent.click(button('Record yourself'))
      await mic.grant()
      const recorder = mic.last()
      expect(await call(reg, 'go_to', { where: direction })).toMatchObject({ ok: true })
      expect(where()).toBe(to)
      expect(recorder.state).toBe('inactive')
      mic.tracks.forEach((track) => expect(track.stop).toHaveBeenCalledTimes(1))
      expect(await recording(reg)).toBe('none')
      view.unmount()
    }
  })

  it('lists the recorder state on the get_entry line of llms.txt', async () => {
    const llms = await readText('public/llms.txt')
    expect(llms).toMatch(/^- `get_entry`: .*recorder's state\.$/m)
    expect(llms).not.toMatch(/^- `[a-z_]*(record|microphone)[a-z_]*`/m)
  })
})
