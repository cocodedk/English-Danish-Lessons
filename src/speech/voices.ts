/**
 * Only a local Danish voice may speak. A remote voice would send the text to a speech service, and
 * no request leaves this site. An English voice reading Danish would teach the wrong sound.
 */
export function pickVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find((v) => v.lang.toLowerCase().startsWith('da') && v.localService)
}

export function getSynth(): SpeechSynthesis | undefined {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : undefined
}

/** Resolves with a qualifying voice as soon as one appears, or undefined after `ms`. */
export function waitForVoice(synth: SpeechSynthesis, ms: number): Promise<SpeechSynthesisVoice | undefined> {
  return new Promise((resolve) => {
    const finish = (voice: SpeechSynthesisVoice | undefined) => {
      clearTimeout(timer)
      synth.removeEventListener('voiceschanged', onChange)
      resolve(voice)
    }
    const onChange = () => {
      const voice = pickVoice(synth.getVoices())
      if (voice) finish(voice)
    }
    const timer = setTimeout(() => finish(undefined), ms)
    synth.addEventListener('voiceschanged', onChange)
  })
}
