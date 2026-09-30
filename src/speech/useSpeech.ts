import { useCallback, useEffect, useRef, useState } from 'react'
import { getSynth, pickVoice, waitForVoice } from './voices'

export const RATE = 0.85
export const VOICE_WAIT_MS = 1000

export type SpeechStatus = 'idle' | 'lookup' | 'speaking'
export type HearResult = { ok: boolean; started: boolean; reason?: 'no-danish-voice' | 'unsupported' | 'error' }

/** Speaks `text` with a local Danish voice, and says so when there is none. */
export function useSpeech(text: string) {
  const supported = getSynth() !== undefined
  const [voices, setVoices] = useState<readonly SpeechSynthesisVoice[]>([])
  const [status, setStatusState] = useState<SpeechStatus>('idle')
  const statusRef = useRef<SpeechStatus>('idle')
  const setStatus = useCallback((next: SpeechStatus) => {
    statusRef.current = next
    setStatusState(next)
  }, [])
  const [tapFoundNone, setTapFoundNone] = useState(false)
  const [failed, setFailed] = useState(false)
  const run = useRef(0)
  const textRef = useRef(text)
  textRef.current = text

  // Read the voices once on mount and keep listening for the life of the page.
  useEffect(() => {
    const synth = getSynth()
    if (!synth) return
    const read = () => setVoices(synth.getVoices())
    read()
    synth.addEventListener('voiceschanged', read)
    return () => {
      synth.removeEventListener('voiceschanged', read)
      run.current += 1
      synth.cancel()
    }
  }, [])

  const hasVoice = pickVoice(voices) !== undefined
  const noVoice = !supported || (!hasVoice && (voices.length > 0 || tapFoundNone))

  const stop = useCallback(() => {
    run.current += 1
    getSynth()?.cancel()
    setStatus('idle')
  }, [])

  const play = useCallback(async (): Promise<HearResult> => {
    const synth = getSynth()
    if (!synth) return { ok: false, started: false, reason: 'unsupported' }
    const id = ++run.current
    synth.cancel()
    setFailed(false)
    setStatus('lookup')
    const voice = pickVoice(synth.getVoices()) ?? (await waitForVoice(synth, VOICE_WAIT_MS))
    if (id !== run.current) return { ok: true, started: false }
    if (!voice) {
      setStatus('idle')
      setTapFoundNone(true)
      return { ok: false, started: false, reason: 'no-danish-voice' }
    }
    setTapFoundNone(false)
    try {
      const utterance = new SpeechSynthesisUtterance(textRef.current)
      utterance.voice = voice
      utterance.lang = voice.lang
      utterance.rate = RATE
      utterance.onend = () => {
        if (id === run.current) setStatus('idle')
      }
      utterance.onerror = (event) => {
        if (id !== run.current) return
        setStatus('idle')
        if (event.error !== 'canceled' && event.error !== 'interrupted') setFailed(true)
      }
      setStatus('speaking')
      synth.speak(utterance)
      return { ok: true, started: true }
    } catch {
      setStatus('idle')
      setFailed(true)
      return { ok: false, started: false, reason: 'error' }
    }
  }, [])

  // The play handler: the button and the hear_entry tool both come here. Pressing while speaking cancels.
  const press = useCallback(async (): Promise<HearResult> => {
    if (statusRef.current === 'idle') return play()
    stop()
    return { ok: true, started: false }
  }, [play, stop])

  const voice: 'available' | 'none' | 'unsupported' = !supported ? 'unsupported' : hasVoice ? 'available' : 'none'
  return { status, supported, noVoice, failed, voice, press }
}
