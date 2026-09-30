import { act, fireEvent, screen } from '@testing-library/react'
import { installSpeech, voice } from '../test/speech'
import { renderAt } from '../test/render'

const NO_VOICE = 'This device has no Danish voice, so there is no sound. Use the sound guide above.'
const NO_SOUND = "This browser can't play sound. Use the sound guide above."
const hear = () => screen.getByRole('button', { name: 'Hear Hej' })
const stopButton = () => screen.getByRole('button', { name: 'Stop' })
const flush = () => act(async () => { await vi.advanceTimersByTimeAsync(0) })
const errorEvent = (error: string) => ({ error }) as unknown as SpeechSynthesisErrorEvent

describe('hearing', () => {
  it('speaks with a local Danish voice at rate 0.85', () => {
    const synth = installSpeech([voice('en-US'), voice('da_DK')])
    renderAt('/lesson/hej-og-tak/1')
    expect(screen.queryByRole('note')).toBeNull()
    fireEvent.click(hear())
    expect(synth.speak).toHaveBeenCalledTimes(1)
    const utterance = synth.spoken[0]
    expect(utterance.text).toBe('Hej')
    expect(utterance.voice?.lang).toBe('da_DK')
    expect(utterance.rate).toBe(0.85)
    expect(stopButton()).toBeInTheDocument()
  })

  it('speaks nothing and shows the note for a remote Danish voice or only other languages', () => {
    for (const voices of [[voice('da-DK', false)], [voice('en-US'), voice('sv-SE')]]) {
      const synth = installSpeech(voices)
      const { unmount } = renderAt('/lesson/hej-og-tak/1')
      expect(screen.getByRole('note')).toHaveTextContent(NO_VOICE)
      expect(hear()).toHaveAttribute('aria-disabled', 'true')
      fireEvent.click(hear())
      expect(synth.speak).not.toHaveBeenCalled()
      unmount()
    }
  })

  it('shows nothing on load when the voice list is empty, and waits at most 1 s on a tap', async () => {
    vi.useFakeTimers()
    const synth = installSpeech([])
    renderAt('/lesson/hej-og-tak/1')
    expect(screen.queryByRole('note')).toBeNull()
    expect(synth.listenerCount('voiceschanged')).toBe(1)
    fireEvent.click(hear())
    expect(stopButton()).toHaveAttribute('aria-busy', 'true')
    expect(synth.listenerCount('voiceschanged')).toBe(2)
    await act(async () => { await vi.advanceTimersByTimeAsync(999) })
    expect(stopButton()).toBeInTheDocument()
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })
    expect(hear()).not.toHaveAttribute('aria-busy')
    expect(screen.getByRole('note')).toHaveTextContent(NO_VOICE)
    expect(synth.listenerCount('voiceschanged')).toBe(1)
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('speaks when a Danish voice appears during the wait', async () => {
    vi.useFakeTimers()
    const synth = installSpeech([])
    renderAt('/lesson/hej-og-tak/1')
    fireEvent.click(hear())
    act(() => synth.setVoices([voice('da-DK')]))
    await flush()
    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(synth.spoken[0].voice?.lang).toBe('da-DK')
    expect(screen.queryByRole('note')).toBeNull()
  })

  it('cancels on a second press', () => {
    const synth = installSpeech([voice('da-DK')])
    renderAt('/lesson/hej-og-tak/1')
    fireEvent.click(hear())
    synth.cancel.mockClear()
    fireEvent.click(stopButton())
    expect(synth.cancel).toHaveBeenCalled()
    expect(hear()).toBeInTheDocument()
  })

  it('resets the button on end, and on error says the sound did not play', () => {
    const synth = installSpeech([voice('da-DK')])
    renderAt('/lesson/hej-og-tak/1')
    fireEvent.click(hear())
    act(() => synth.spoken[0].onend?.(new Event('end') as SpeechSynthesisEvent))
    expect(hear()).toBeInTheDocument()
    fireEvent.click(hear())
    act(() => synth.spoken[1].onerror?.(errorEvent('canceled')))
    expect(hear()).toBeInTheDocument()
    expect(screen.queryByText("The sound didn't play. Try again.")).toBeNull()
    fireEvent.click(hear())
    act(() => synth.spoken[2].onerror?.(errorEvent('synthesis-failed')))
    expect(hear()).toBeInTheDocument()
    expect(screen.getByText("The sound didn't play. Try again.")).toBeInTheDocument()
  })

  it('says the browser cannot play sound when there is no speech API', () => {
    renderAt('/lesson/hej-og-tak/1')
    expect(screen.getByRole('note')).toHaveTextContent(NO_SOUND)
    expect(hear()).toHaveAttribute('aria-disabled', 'true')
  })
})
