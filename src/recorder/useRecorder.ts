import { useEffect, useReducer, useRef } from 'react'
import { canAsk, initialPlay, initialRecord, playReducer, recordReducer } from './machine'

type Take = { stream?: MediaStream; recorder?: MediaRecorder; audio?: HTMLAudioElement; url?: string }

const canRecord = () =>
  typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function' && typeof MediaRecorder !== 'undefined'

const stopTracks = (stream: MediaStream) => stream.getTracks().forEach((track) => track.stop())

/**
 * Records the learner once and plays the take back. The take lives in memory only: leaving the page
 * discards it. `stopSpeech` cancels the Danish voice whenever recording or playback starts.
 */
export function useRecorder(stopSpeech: () => void) {
  const [rec, dispatchRec] = useReducer(recordReducer, undefined, () => initialRecord(canRecord()))
  const [play, dispatchPlay] = useReducer(playReducer, initialPlay)
  const take = useRef<Take>({})
  const run = useRef(0) // bumps when the take is discarded, so a late answer from the old take is ignored
  const playRun = useRef(0) // bumps when playback is cancelled, for the same reason

  const halt = () => {
    const { recorder, stream } = take.current
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop()
      } catch {
        // already stopped
      }
    }
    if (stream) stopTracks(stream)
    take.current.stream = undefined
  }

  const silence = () => {
    playRun.current += 1
    const { audio } = take.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
  }

  const discard = () => {
    run.current += 1
    const { recorder, audio, url } = take.current
    if (recorder) {
      recorder.ondataavailable = null
      recorder.onstop = null
      recorder.onerror = null
    }
    halt()
    if (audio) {
      silence()
      audio.onended = null
      audio.onerror = null
    }
    if (url) URL.revokeObjectURL(url)
    take.current = {}
    dispatchPlay({ type: 'cancel' })
  }

  // The one-second clock, which also ends the take at the 20 s limit.
  useEffect(() => {
    if (rec.phase !== 'recording') return
    const timer = setInterval(() => dispatchRec({ type: 'tick' }), 1000)
    return () => clearInterval(timer)
  }, [rec.phase])
  useEffect(() => {
    if (rec.phase === 'finishing') halt()
  }, [rec.phase])
  useEffect(() => discard, [])
  // A page kept in the back/forward cache is hidden, not unmounted: the take must not survive that.
  useEffect(() => {
    const leave = () => {
      discard()
      dispatchRec({ type: 'reset' })
    }
    window.addEventListener('pagehide', leave)
    return () => window.removeEventListener('pagehide', leave)
  }, [])

  const keep = (recorder: MediaRecorder, chunks: Blob[]) => {
    const blob = new Blob(chunks, { type: recorder.mimeType })
    dispatchRec({ type: 'stop' }) // the recorder can also end by itself
    if (blob.size === 0) return dispatchRec({ type: 'data', bytes: 0 })
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => dispatchPlay({ type: 'ended' })
    audio.onerror = () => dispatchPlay({ type: 'fail' })
    take.current = { ...take.current, url, audio }
    dispatchRec({ type: 'data', bytes: blob.size })
  }

  const record = async () => {
    if (!canAsk(rec.phase)) return
    discard()
    const id = run.current
    dispatchRec({ type: 'ask' })
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      if (id === run.current) dispatchRec({ type: 'error', name: (error as { name?: string } | null)?.name })
      return
    }
    if (id !== run.current) return stopTracks(stream)
    try {
      stopSpeech()
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      recorder.ondataavailable = (event) => {
        if (event.data) chunks.push(event.data)
      }
      recorder.onstop = () => {
        if (id !== run.current) return
        halt()
        keep(recorder, chunks)
      }
      recorder.onerror = () => {
        if (id !== run.current) return
        discard()
        dispatchRec({ type: 'fail' })
      }
      take.current = { stream, recorder }
      recorder.start()
      dispatchRec({ type: 'granted' })
    } catch {
      stopTracks(stream)
      take.current = {}
      dispatchRec({ type: 'fail' })
    }
  }

  const stop = () => {
    if (rec.phase !== 'recording') return
    dispatchRec({ type: 'stop' })
    halt()
  }

  const stopPlayback = () => {
    if (play.phase === 'idle') return
    silence()
    dispatchPlay({ type: 'cancel' })
  }

  // Pressing while it starts or plays cancels; a rejected play() leaves the take kept.
  const hear = () => {
    const { audio } = take.current
    if (rec.phase !== 'recorded' || !audio) return
    if (play.phase !== 'idle') return stopPlayback()
    stopSpeech()
    dispatchPlay({ type: 'press' })
    const id = ++playRun.current
    audio.currentTime = 0
    let started: Promise<unknown>
    try {
      started = Promise.resolve(audio.play())
    } catch (error) {
      started = Promise.reject(error)
    }
    started.then(
      () => id === playRun.current && dispatchPlay({ type: 'started' }),
      () => id === playRun.current && dispatchPlay({ type: 'fail' }),
    )
  }

  return { phase: rec.phase, elapsed: rec.elapsed, playPhase: play.phase, playFailed: play.failed, record, stop, hear, stopPlayback }
}
