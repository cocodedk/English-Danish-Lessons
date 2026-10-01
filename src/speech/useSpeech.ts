import { useCallback, useEffect, useRef, useState } from 'react'
import { getSynth, pickVoice, waitForVoice } from './voices'

export const RATE = 0.85
export const VOICE_WAIT_MS = 1000
export const VOICE_CHECK_MS = 2000

export type VoiceState = 'checking' | 'available' | 'none' | 'unsupported'
/** What the WebMCP tools report: `checking` is `unknown`. */
export type ToolVoice = Exclude<VoiceState, 'checking'> | 'unknown'
export const toolVoice = (state: VoiceState): ToolVoice => (state === 'checking' ? 'unknown' : state)

export type SpeechStatus = 'idle' | 'lookup' | 'speaking'
export type HearResult = { ok: boolean; started: boolean; reason?: 'no-danish-voice' | 'unsupported' | 'error' | 'recording' }

/** Speaks `text` with a local Danish voice, and says so when there is none. `play` and `press` take another text for a page with many words. */
export function useSpeech(text = '') {
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

  const [timedOut, setTimedOut] = useState(false)

  // Read the voices once on mount and keep listening for the life of the page. An empty list
  // gets VOICE_CHECK_MS to fill before it counts as no voice.
  useEffect(() => {
    const synth = getSynth()
    if (!synth) return
    const read = () => setVoices(synth.getVoices())
    read()
    synth.addEventListener('voiceschanged', read)
    const timer = setTimeout(() => setTimedOut(true), VOICE_CHECK_MS)
    return () => {
      clearTimeout(timer)
      synth.removeEventListener('voiceschanged', read)
      run.current += 1
      synth.cancel()
    }
  }, [])

  const hasVoice = pickVoice(voices) !== undefined
  const voice: VoiceState = !supported
    ? 'unsupported'
    : hasVoice
      ? 'available'
      : voices.length > 0 || tapFoundNone || timedOut
        ? 'none'
        : 'checking'
  const noVoice = voice === 'none' || voice === 'unsupported'

  const stop = useCallback(() => {
    run.current += 1
    getSynth()?.cancel()
    setStatus('idle')
  }, [])

  const play = useCallback(async (word?: string): Promise<HearResult> => {
    const synth = getSynth()
    if (!synth) return { ok: false, started: false, reason: 'unsupported' }
    const id = ++run.current
    synth.cancel()
    setFailed(false)
    setStatus('lookup')
    const found = pickVoice(synth.getVoices()) ?? (await waitForVoice(synth, VOICE_WAIT_MS))
    if (id !== run.current) return { ok: true, started: false }
    if (!found) {
      setStatus('idle')
      setTapFoundNone(true)
      return { ok: false, started: false, reason: 'no-danish-voice' }
    }
    setTapFoundNone(false)
    try {
      const utterance = new SpeechSynthesisUtterance(word ?? textRef.current)
      utterance.voice = found
      utterance.lang = found.lang
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
  const press = useCallback(async (word?: string): Promise<HearResult> => {
    if (statusRef.current === 'idle') return play(word)
    stop()
    return { ok: true, started: false }
  }, [play, stop])

  return { status, supported, noVoice, failed, voice, press, play, stop }
}
