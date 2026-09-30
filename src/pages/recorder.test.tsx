import { act, fireEvent, screen, within } from '@testing-library/react'
import { renderAt } from '../test/render'
import { installRecorder } from '../test/recorder'
import { installSpeech, voice } from '../test/speech'

const PATH = '/lesson/hej-og-tak/1'
const PRIVACY = 'Your recording stays on this device and is gone when you leave this page.'
const BLOCKED = 'The microphone is blocked. Allow it in your browser settings, then try again.'
const NO_MIC = 'No microphone found. Plug one in or check your settings.'
const FAILED = "Recording didn't work. Try again."
const NO_PLAY = "The recording didn't play. Try again."
const region = () => screen.getByRole('region', { name: 'Record yourself' })
const button = (name: string) => screen.getByRole('button', { name })
const announced = () => within(region()).getAllByRole('status')[0]
const flush = () => act(async () => {})
const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms) })
type Mic = ReturnType<typeof installRecorder>

async function recordTake(mic: Mic) {
  fireEvent.click(button('Record yourself'))
  await mic.grant()
  fireEvent.click(button('Stop'))
  await mic.finish()
}

describe('recorder on the entry page', () => {
  it('says the browser cannot record, with no button and no status region', () => {
    renderAt(PATH)
    expect(region()).toHaveTextContent("This browser can't record. You can still say it out loud.")
    expect(within(region()).queryByRole('button')).toBeNull()
    expect(within(region()).queryByRole('status')).toBeNull()
  })

  it('sits between the Lamp row and "I said it", with no heading, and starts idle', () => {
    const mic = installRecorder()
    renderAt(PATH)
    const order = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByText('Not lit yet'),
      region(),
      button('I said it'),
      screen.getByText('Say it out loud, then tap “I said it”.'),
      button('Back'),
    ]
    order.slice(1).forEach((node, i) => {
      expect(order[i].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
    expect(within(region()).queryByRole('heading')).toBeNull()
    expect(button('Record yourself')).toBeInTheDocument()
    expect(region()).toHaveTextContent(PRIVACY)
    expect(mic.getUserMedia).not.toHaveBeenCalled()
  })

  it('asks for audio only and waits, then records with one Stop and Danish hearing off', async () => {
    installSpeech([voice('da-DK')])
    const mic = installRecorder()
    renderAt(PATH)
    fireEvent.click(button('Record yourself'))
    expect(mic.getUserMedia).toHaveBeenCalledWith({ audio: true })
    const waiting = button('Waiting for permission…')
    expect(waiting).toHaveAttribute('aria-disabled', 'true')
    expect(waiting).toHaveAttribute('aria-busy', 'true')
    expect(region()).not.toHaveTextContent(PRIVACY)
    expect(button('Hear Hej')).not.toHaveAttribute('aria-disabled')
    await mic.grant()
    expect(mic.last().start).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole('button', { name: 'Stop' })).toHaveLength(1)
    expect(button('Hear Hej')).toHaveAttribute('aria-disabled', 'true')
    expect(announced()).toHaveTextContent('Recording.')
    expect(region()).toHaveTextContent('Recording… 0:00')
    expect(region()).toHaveTextContent(PRIVACY)
  })

  it('counts up once a second and stops by itself at 20 seconds', async () => {
    vi.useFakeTimers()
    const mic = installRecorder()
    renderAt(PATH)
    fireEvent.click(button('Record yourself'))
    await mic.grant()
    await tick(7000)
    expect(region()).toHaveTextContent('Recording… 0:07')
    await tick(12000)
    expect(region()).toHaveTextContent('Recording… 0:19')
    expect(mic.last().stop).not.toHaveBeenCalled()
    await tick(1000)
    expect(mic.last().stop).toHaveBeenCalledTimes(1)
    mic.tracks.forEach((track) => expect(track.stop).toHaveBeenCalledTimes(1))
    const saving = button('Saving…')
    expect(saving).toHaveAttribute('aria-disabled', 'true')
    expect(saving).toHaveAttribute('aria-busy', 'true')
    expect(announced()).toHaveTextContent('Recording stopped.')
    await tick(5000)
    expect(region()).toHaveTextContent('Recording… 0:20')
    await mic.finish()
    expect(button('Hear yourself')).toBeInTheDocument()
  })

  it('releases every track on Stop, saves, then offers Hear yourself and Record again', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    fireEvent.click(button('Record yourself'))
    await mic.grant()
    fireEvent.click(button('Stop'))
    expect(mic.last().stop).toHaveBeenCalledTimes(1)
    mic.tracks.forEach((track) => expect(track.stop).toHaveBeenCalledTimes(1))
    expect(button('Saving…')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('button', { name: 'Stop' })).toBeNull()
    expect(region()).not.toHaveTextContent(PRIVACY)
    await mic.finish()
    const blob = mic.createObjectURL.mock.calls[0] as unknown as [Blob]
    expect(blob[0]).toBeInstanceOf(Blob)
    expect(blob[0].type).toBe('audio/webm')
    expect(button('Hear yourself')).toBeInTheDocument()
    expect(button('Record again')).toBeInTheDocument()
    expect(announced()).toHaveTextContent('Recording stopped.')
    expect(region()).toHaveTextContent(PRIVACY)
  })

  it('shows the exact sentence for each error, without the privacy line, and Try again asks again', async () => {
    const mic = installRecorder()
    const cases: [string, string][] = [
      ['NotAllowedError', BLOCKED],
      ['SecurityError', BLOCKED],
      ['NotFoundError', NO_MIC],
      ['OverconstrainedError', NO_MIC],
      ['NotReadableError', FAILED],
    ]
    renderAt(PATH)
    fireEvent.click(button('Record yourself'))
    for (const [name, sentence] of cases) {
      await mic.refuse(name)
      expect(within(region()).getByText(sentence), name).toHaveAttribute('role', 'status')
      expect(region()).not.toHaveTextContent(PRIVACY)
      fireEvent.click(button('Try again'))
    }
    expect(mic.getUserMedia).toHaveBeenCalledTimes(cases.length + 1)
    await mic.grant()
    expect(button('Stop')).toBeInTheDocument()
  })

  it('starts on Hear yourself at once, cancels while starting, and resets when it ends', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    await recordTake(mic)
    let resolvePlay = () => {}
    mic.play.mockImplementationOnce(() => new Promise<void>((resolve) => { resolvePlay = resolve }))
    fireEvent.click(button('Hear yourself'))
    expect(button('Stop')).toHaveAttribute('aria-busy', 'true')
    await act(async () => resolvePlay())
    expect(button('Stop')).not.toHaveAttribute('aria-busy')
    fireEvent(mic.audio(), new Event('ended'))
    expect(button('Hear yourself')).toBeInTheDocument()
    mic.play.mockImplementationOnce(() => new Promise<void>(() => {}))
    mic.pause.mockClear()
    fireEvent.click(button('Hear yourself'))
    fireEvent.click(button('Stop'))
    expect(mic.pause).toHaveBeenCalled()
    expect(button('Hear yourself')).toBeInTheDocument()
    expect(screen.queryByText(NO_PLAY)).toBeNull()
  })

  it('keeps the take when playback fails, and retries it without asking for the microphone', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    await recordTake(mic)
    mic.play.mockRejectedValueOnce(new Error('no'))
    fireEvent.click(button('Hear yourself'))
    await flush()
    expect(screen.getByText(NO_PLAY)).toHaveAttribute('role', 'status')
    expect(button('Hear yourself')).toBeInTheDocument()
    expect(mic.revokeObjectURL).not.toHaveBeenCalled()
    fireEvent.click(button('Hear yourself'))
    await flush()
    expect(button('Stop')).toBeInTheDocument()
    expect(screen.queryByText(NO_PLAY)).toBeNull()
    fireEvent(mic.audio(), new Event('error'))
    expect(screen.getByText(NO_PLAY)).toBeInTheDocument()
    expect(button('Hear yourself')).toBeInTheDocument()
    expect(mic.getUserMedia).toHaveBeenCalledTimes(1)
  })

  it('discards the old take on Record again and starts a new one', async () => {
    const mic = installRecorder()
    renderAt(PATH)
    await recordTake(mic)
    fireEvent.click(button('Record again'))
    expect(mic.revokeObjectURL).toHaveBeenCalledWith('blob:take-1')
    expect(mic.getUserMedia).toHaveBeenCalledTimes(2)
    expect(button('Waiting for permission…')).toBeInTheDocument()
    await mic.grant()
    fireEvent.click(button('Stop'))
    await mic.finish()
    expect(mic.createObjectURL).toHaveBeenCalledTimes(2)
    expect(button('Hear yourself')).toBeInTheDocument()
  })
})
