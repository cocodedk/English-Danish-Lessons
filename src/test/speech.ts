/** A fake `speechSynthesis` for tests: it records what was spoken and lets a test change the voices. */
export function voice(lang: string, localService = true): SpeechSynthesisVoice {
  return { name: lang, lang, localService, default: false, voiceURI: lang } as SpeechSynthesisVoice
}

export function installSpeech(initial: SpeechSynthesisVoice[]) {
  const listeners = new Map<string, Set<() => void>>()
  const synth = {
    voices: initial,
    spoken: [] as SpeechSynthesisUtterance[],
    getVoices: () => synth.voices,
    speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
      synth.spoken.push(utterance)
    }),
    cancel: vi.fn(),
    addEventListener: vi.fn((type: string, fn: () => void) => {
      listeners.set(type, (listeners.get(type) ?? new Set<() => void>()).add(fn))
    }),
    removeEventListener: vi.fn((type: string, fn: () => void) => {
      listeners.get(type)?.delete(fn)
    }),
    listenerCount: (type: string) => listeners.get(type)?.size ?? 0,
    setVoices(next: SpeechSynthesisVoice[]) {
      synth.voices = next
      listeners.get('voiceschanged')?.forEach((fn) => fn())
    },
  }
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true, writable: true })
  return synth
}
