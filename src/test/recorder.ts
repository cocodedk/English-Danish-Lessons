import { act } from '@testing-library/react'

/** Fakes for the recorder: the microphone, `MediaRecorder`, object URLs and audio playback. `src/test/setup.ts` removes them after each test. */
export class FakeRecorder {
  state: 'inactive' | 'recording' = 'inactive'
  mimeType = 'audio/webm'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  start = vi.fn(() => {
    this.state = 'recording'
  })
  stop = vi.fn(() => {
    this.state = 'inactive'
  })
  constructor(public stream: MediaStream) {}
}

export function installRecorder() {
  const tracks = [{ stop: vi.fn() }, { stop: vi.fn() }]
  const stream = { getTracks: () => tracks } as unknown as MediaStream
  const recorders: FakeRecorder[] = []
  let answer: { grant: () => void; refuse: (error: unknown) => void } | undefined
  const getUserMedia = vi.fn(
    () =>
      new Promise<MediaStream>((resolve, reject) => {
        answer = { grant: () => resolve(stream), refuse: reject }
      }),
  )
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true, writable: true })
  /** Set one to make the next recorder throw from its constructor or from `start()`. */
  const fail = { construct: false, start: false }
  class Recorder extends FakeRecorder {
    constructor(media: MediaStream) {
      super(media)
      if (fail.construct) throw new Error('no recorder')
      recorders.push(this)
      if (fail.start) this.start = vi.fn(() => { throw new Error('no start') })
    }
  }
  Object.defineProperty(globalThis, 'MediaRecorder', { value: Recorder, configurable: true, writable: true })

  let made = 0
  const createObjectURL = vi.fn(() => `blob:take-${++made}`)
  const revokeObjectURL = vi.fn()
  Object.assign(URL, { createObjectURL, revokeObjectURL })
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)

  return {
    fail,
    getUserMedia,
    tracks,
    recorders,
    createObjectURL,
    revokeObjectURL,
    play,
    pause,
    last: () => recorders[recorders.length - 1],
    /** The audio element of the latest `play()` call. */
    audio: () => play.mock.contexts[play.mock.contexts.length - 1] as HTMLAudioElement,
    grant: () => act(async () => answer?.grant()),
    refuse: (name: string) => act(async () => answer?.refuse(Object.assign(new Error(name), { name }))),
    /** The recorder delivers its last data (`bytes` long) and stops. */
    finish: (bytes = 4) =>
      act(async () => {
        const recorder = recorders[recorders.length - 1]
        recorder.ondataavailable?.({ data: new Blob(['x'.repeat(bytes)]) })
        recorder.onstop?.()
      }),
  }
}

export function removeRecorder() {
  Reflect.deleteProperty(navigator, 'mediaDevices')
  Reflect.deleteProperty(globalThis, 'MediaRecorder')
  Reflect.deleteProperty(URL, 'createObjectURL')
  Reflect.deleteProperty(URL, 'revokeObjectURL')
}
