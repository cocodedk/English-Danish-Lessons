import { act } from '@testing-library/react'
import { readText } from '../test/files'
import { call } from '../test/mcpCalls'
import { renderAt } from '../test/render'
import { installSpeech, voice } from '../test/speech'
import { installModelContext } from '../test/webmcp'

describe('get_street.voice', () => {
  it('reports the voice state: unknown while checking, then the state itself', async () => {
    const reg = installModelContext()
    const none = renderAt('/')
    expect((await call(reg, 'get_street')).voice).toBe('unsupported')
    none.unmount()
    vi.useFakeTimers()
    const cases: [SpeechSynthesisVoice[], string][] = [
      [[voice('da-DK')], 'available'],
      [[voice('en-US')], 'none'],
    ]
    for (const [voices, expected] of cases) {
      installSpeech(voices)
      const view = renderAt('/')
      expect((await call(reg, 'get_street')).voice).toBe(expected)
      view.unmount()
    }
    installSpeech([])
    renderAt('/')
    expect((await call(reg, 'get_street')).voice).toBe('unknown')
    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
    expect((await call(reg, 'get_street')).voice).toBe('none')
  })

  it('says on the get_street line of llms.txt that it returns whether a Danish voice is available', async () => {
    expect(await readText('public/llms.txt')).toMatch(/^- `get_street`: .*whether a Danish voice is available.*$/m)
  })
})
