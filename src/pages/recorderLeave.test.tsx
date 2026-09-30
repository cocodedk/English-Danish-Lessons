import { act, fireEvent, screen, type RenderResult } from '@testing-library/react'
import { getLesson } from '../catalog'
import { resetStorage } from '../storage/core'
import { renderAt } from '../test/render'
import { installRecorder, removeRecorder } from '../test/recorder'
import { installSpeech, voice } from '../test/speech'

const PATH = '/lesson/hej-og-tak/1'
const entries = getLesson('hej-og-tak')!.entries
const button = (name: string) => screen.getByRole('button', { name })
const flush = () => act(async () => {})
const stored = () => JSON.parse(localStorage.getItem('edl.v1.progress') ?? 'null')?.value?.lit?.['hej-og-tak'] ?? []
type Mic = ReturnType<typeof installRecorder>

const LEAVE: [string, (view: RenderResult) => void][] = [
  ['the Next link', () => fireEvent.click(screen.getByRole('link', { name: 'Next: Goddag' }))],
  ['the street link', () => fireEvent.click(screen.getByRole('link', { name: 'Back to your street' }))],
  ['an unmount', (view) => view.unmount()],
]

async function record(mic: Mic) {
  fireEvent.click(button('Record yourself'))
  await mic.grant()
}
async function recordTake(mic: Mic) {
  await record(mic)
  fireEvent.click(button('Stop'))
  await mic.finish()
}

describe('leaving the entry', () => {
  it('stops a running recorder and releases the tracks, by every way out', async () => {
    const mic = installRecorder()
    for (const [name, leave] of LEAVE) {
      mic.tracks.forEach((track) => track.stop.mockClear())
      const view = renderAt(PATH)
      await record(mic)
      const recorder = mic.last()
      leave(view)
      expect(recorder.stop, name).toHaveBeenCalledTimes(1)
      expect(recorder.state, name).toBe('inactive')
      mic.tracks.forEach((track) => expect(track.stop, name).toHaveBeenCalledTimes(1))
      view.unmount()
    }
  })

  it('stops playback and revokes the object URL when a played take is left', async () => {
    const mic = installRecorder()
    for (const [name, leave] of LEAVE) {
      const view = renderAt(PATH)
      await recordTake(mic)
      fireEvent.click(button('Hear yourself'))
      await flush()
      mic.pause.mockClear()
      leave(view)
      expect(mic.pause, name).toHaveBeenCalled()
      expect(mic.revokeObjectURL, name).toHaveBeenCalledWith(`blob:take-${mic.createObjectURL.mock.calls.length}`)
      view.unmount()
    }
  })

  it('discards a take that was still finishing, and a microphone that answers after leaving', async () => {
    const mic = installRecorder()
    const first = renderAt(PATH)
    await record(mic)
    const recorder = mic.last()
    fireEvent.click(button('Stop'))
    first.unmount()
    await mic.finish()
    expect(recorder.stop).toHaveBeenCalled()
    expect(mic.createObjectURL).not.toHaveBeenCalled()
    mic.tracks.forEach((track) => track.stop.mockClear())
    const second = renderAt(PATH)
    fireEvent.click(button('Record yourself'))
    second.unmount()
    await mic.grant()
    mic.tracks.forEach((track) => expect(track.stop).toHaveBeenCalledTimes(1))
    expect(mic.recorders).toHaveLength(1)
  })
})

describe('recorder beside the other controls', () => {
  it('cancels speech when recording starts and when the recording plays, and the Danish stops the playback', async () => {
    const synth = installSpeech([voice('da-DK')])
    const mic = installRecorder()
    renderAt(PATH)
    fireEvent.click(button('Hear Hej'))
    await flush()
    expect(button('Stop')).toBeInTheDocument()
    synth.cancel.mockClear()
    await record(mic)
    expect(synth.cancel).toHaveBeenCalled()
    expect(button('Hear Hej')).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(button('Stop'))
    await mic.finish()
    synth.cancel.mockClear()
    fireEvent.click(button('Hear yourself'))
    await flush()
    expect(synth.cancel).toHaveBeenCalled()
    expect(button('Stop')).toBeInTheDocument()
    mic.pause.mockClear()
    synth.speak.mockClear()
    fireEvent.click(button('Hear Hej'))
    await flush()
    expect(mic.pause).toHaveBeenCalled()
    expect(button('Hear yourself')).toBeInTheDocument()
    expect(synth.speak).toHaveBeenCalledTimes(1)
  })

  it('lights the window with "I said it" in every recorder state, and never by recording', async () => {
    const mic = installRecorder()
    const states: [string, () => Promise<void>][] = [
      ['idle', async () => {}],
      ['asking', async () => { fireEvent.click(button('Record yourself')) }],
      ['recording', () => record(mic)],
      ['finishing', async () => { await record(mic); fireEvent.click(button('Stop')) }],
      ['recorded', () => recordTake(mic)],
      ['denied', async () => { fireEvent.click(button('Record yourself')); await mic.refuse('NotAllowedError') }],
      ['no-microphone', async () => { fireEvent.click(button('Record yourself')); await mic.refuse('NotFoundError') }],
      ['failed', async () => { fireEvent.click(button('Record yourself')); await mic.refuse('AbortError') }],
    ]
    for (const [i, [name, drive]] of states.entries()) {
      const view = renderAt(`/lesson/hej-og-tak/${i + 1}`)
      await drive()
      expect(stored(), name).not.toContain(entries[i].id)
      expect(screen.getByText('Not lit yet'), name).toBeInTheDocument()
      fireEvent.click(button('I said it'))
      expect(stored(), name).toContain(entries[i].id)
      expect(screen.getByText('Lit'), name).toBeInTheDocument()
      view.unmount()
    }
    removeRecorder()
    localStorage.clear()
    resetStorage()
    renderAt(PATH)
    fireEvent.click(button('I said it'))
    expect(stored()).toEqual(['hej'])
  })

  it('writes nothing to storage through a full record, play and leave cycle', async () => {
    const mic = installRecorder()
    const before = JSON.stringify(Object.entries(localStorage))
    const view = renderAt(PATH)
    await recordTake(mic)
    fireEvent.click(button('Hear yourself'))
    await flush()
    fireEvent.click(screen.getByRole('link', { name: 'Next: Goddag' }))
    view.unmount()
    expect(JSON.stringify(Object.entries(localStorage))).toBe(before)
    expect(localStorage).toHaveLength(0)
  })

  it('rewords the two sound notices while the recorder can play, and Hear yourself still works', async () => {
    const cases: [string, () => void][] = [
      ['This device has no Danish voice, so the word has no sound. Use the sound guide above.', () => installSpeech([voice('en-US')])],
      ["This browser can't play the Danish voice. Use the sound guide above.", () => {}],
    ]
    for (const [note, setup] of cases) {
      setup()
      const mic = installRecorder()
      const view = renderAt(PATH)
      expect(screen.getByRole('note')).toHaveTextContent(note)
      await recordTake(mic)
      mic.play.mockClear()
      fireEvent.click(button('Hear yourself'))
      await flush()
      expect(button('Stop')).toBeInTheDocument()
      expect(mic.play).toHaveBeenCalledTimes(1)
      view.unmount()
      Reflect.deleteProperty(window, 'speechSynthesis')
    }
  })
})
