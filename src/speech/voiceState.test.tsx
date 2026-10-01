import { act, render, screen } from '@testing-library/react'
import { installSpeech, voice } from '../test/speech'
import { useSpeech } from './useSpeech'

function State() {
  return <p data-testid="state">{useSpeech().voice}</p>
}
const state = () => screen.getByTestId('state').textContent
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms) })

describe('voice state', () => {
  it('is unsupported with no speech API, available with a local Danish voice, and none at once for any other list', () => {
    const cases: [SpeechSynthesisVoice[] | undefined, string][] = [
      [undefined, 'unsupported'],
      [[voice('en-US'), voice('da_DK')], 'available'],
      [[voice('en-US'), voice('sv-SE')], 'none'],
      [[voice('da-DK', false)], 'none'],
    ]
    for (const [voices, expected] of cases) {
      if (voices) installSpeech(voices)
      const { unmount } = render(<State />)
      expect(state(), expected).toBe(expected)
      unmount()
    }
  })

  it('checks an empty list, then says none after exactly 2 s with no event', async () => {
    vi.useFakeTimers()
    installSpeech([])
    render(<State />)
    expect(state()).toBe('checking')
    await advance(1999)
    expect(state()).toBe('checking')
    await advance(1)
    expect(state()).toBe('none')
  })

  it('turns checking into available when a qualifying voice arrives before 2 s', async () => {
    vi.useFakeTimers()
    const synth = installSpeech([])
    render(<State />)
    await advance(1500)
    act(() => synth.setVoices([voice('da-DK')]))
    expect(state()).toBe('available')
    await advance(1000)
    expect(state()).toBe('available')
  })

  it('says none by 2 s when installed voices are removed after a nonempty mount', async () => {
    vi.useFakeTimers()
    const synth = installSpeech([voice('da-DK')])
    render(<State />)
    expect(state()).toBe('available')
    act(() => synth.setVoices([]))
    expect(state()).toBe('checking')
    await advance(2000)
    expect(state()).toBe('none')
    act(() => synth.setVoices([voice('da-DK')]))
    expect(state()).toBe('available')
  })

  it('turns none back into available when a qualifying voice arrives after 2 s', async () => {
    vi.useFakeTimers()
    const synth = installSpeech([])
    render(<State />)
    await advance(2000)
    expect(state()).toBe('none')
    act(() => synth.setVoices([voice('en-US')]))
    expect(state()).toBe('none')
    act(() => synth.setVoices([voice('en-US'), voice('da-DK')]))
    expect(state()).toBe('available')
  })
})
