import { act, fireEvent, screen, within } from '@testing-library/react'
import { renderAt } from '../test/render'
import { installRecorder } from '../test/recorder'

const PATH = '/lesson/hej-og-tak/1'
const PRIVACY = 'Your recording stays on this device and is gone when you leave this page.'
const FAILED = "Recording didn't work. Try again."
const region = () => screen.getByRole('region', { name: 'Record yourself' })
const button = (name: string) => screen.getByRole('button', { name })
type Mic = ReturnType<typeof installRecorder>

async function recordTake(mic: Mic, bytes = 4) {
  fireEvent.click(button('Record yourself'))
  await mic.grant()
  fireEvent.click(button('Stop'))
  await mic.finish(bytes)
}

function expectFailedAndReleased(mic: Mic) {
  expect(within(region()).getByText(FAILED)).toHaveAttribute('role', 'status')
  expect(region()).not.toHaveTextContent(PRIVACY)
  expect(button('Try again')).toBeInTheDocument()
  mic.tracks.forEach((track) => expect(track.stop).toHaveBeenCalledTimes(1))
}

describe('recorder failures and the hidden page', () => {
  it('fails on an empty take and offers Try again', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    await recordTake(mic, 0)
    expect(within(region()).getByText(FAILED)).toHaveAttribute('role', 'status')
    expect(button('Try again')).toBeInTheDocument()
    expect(region()).not.toHaveTextContent(PRIVACY)
    expect(mic.createObjectURL).not.toHaveBeenCalled()
  })

  it('fails, releases the tracks and lets the learner retry when MediaRecorder cannot be made or started', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    for (const kind of ['construct', 'start'] as const) {
      mic.tracks.forEach((track) => track.stop.mockClear())
      mic.fail[kind] = true
      fireEvent.click(screen.queryByRole('button', { name: 'Record yourself' }) ?? button('Try again'))
      await mic.grant()
      expectFailedAndReleased(mic)
      mic.fail[kind] = false
    }
    fireEvent.click(button('Try again'))
    await mic.grant()
    expect(button('Stop')).toBeInTheDocument()
    expect(mic.getUserMedia).toHaveBeenCalledTimes(3)
  })

  it('fails, stops the recorder and releases the tracks when the recorder reports an error, and retries', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    fireEvent.click(button('Record yourself'))
    await mic.grant()
    const recorder = mic.last()
    act(() => recorder.onerror?.())
    expectFailedAndReleased(mic)
    expect(recorder.stop).toHaveBeenCalledTimes(1)
    fireEvent.click(button('Try again'))
    await mic.grant()
    expect(mic.recorders).toHaveLength(2)
    expect(button('Stop')).toBeInTheDocument()
  })

  it('drops the take when the page is hidden, so the back/forward cache does not keep it', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    await recordTake(mic)
    fireEvent.click(button('Hear yourself'))
    await act(async () => {})
    mic.pause.mockClear()
    act(() => { window.dispatchEvent(new Event('pagehide')) })
    expect(mic.pause).toHaveBeenCalled()
    expect(mic.revokeObjectURL).toHaveBeenCalledWith('blob:take-1')
    expect(button('Record yourself')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hear yourself' })).toBeNull()
    mic.tracks.forEach((track) => track.stop.mockClear())
    fireEvent.click(button('Record yourself'))
    await mic.grant()
    const recorder = mic.last()
    act(() => { window.dispatchEvent(new Event('pagehide')) })
    expect(recorder.state).toBe('inactive')
    mic.tracks.forEach((track) => expect(track.stop).toHaveBeenCalledTimes(1))
    expect(button('Record yourself')).toBeInTheDocument()
  })
})
