// The recorder's two small state machines, pure so they test without React or a browser.

export const LIMIT_SECONDS = 20

export type RecordPhase =
  | 'idle'
  | 'asking'
  | 'recording'
  | 'finishing'
  | 'recorded'
  | 'denied'
  | 'no-microphone'
  | 'failed'
  | 'unsupported'

export type RecordState = { phase: RecordPhase; elapsed: number }

export type RecordEvent =
  | { type: 'ask' }
  | { type: 'granted' }
  | { type: 'error'; name?: string }
  | { type: 'tick' }
  | { type: 'stop' }
  | { type: 'data'; bytes: number }
  | { type: 'fail' }
  | { type: 'reset' }

export const initialRecord = (supported: boolean): RecordState => ({ phase: supported ? 'idle' : 'unsupported', elapsed: 0 })

/** A refused permission is `denied`, a missing device is `no-microphone`, anything else is `failed`. */
export function errorPhase(name?: string): RecordPhase {
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no-microphone'
  return 'failed'
}

/** `Record yourself`, `Record again` and `Try again` all ask for the microphone, from these phases. */
export const canAsk = (phase: RecordPhase) => ['idle', 'recorded', 'denied', 'no-microphone', 'failed'].includes(phase)

export function recordReducer(state: RecordState, event: RecordEvent): RecordState {
  const { phase } = state
  switch (event.type) {
    case 'ask':
      return canAsk(phase) ? { phase: 'asking', elapsed: 0 } : state
    case 'granted':
      return phase === 'asking' ? { phase: 'recording', elapsed: 0 } : state
    case 'error':
      return phase === 'asking' ? { phase: errorPhase(event.name), elapsed: 0 } : state
    case 'tick': {
      if (phase !== 'recording') return state
      const elapsed = state.elapsed + 1
      return elapsed >= LIMIT_SECONDS ? { phase: 'finishing', elapsed } : { phase, elapsed }
    }
    case 'stop':
      return phase === 'recording' ? { phase: 'finishing', elapsed: state.elapsed } : state
    case 'data':
      if (phase !== 'finishing') return state
      return { phase: event.bytes > 0 ? 'recorded' : 'failed', elapsed: state.elapsed }
    case 'fail':
      return phase === 'asking' || phase === 'recording' || phase === 'finishing' ? { phase: 'failed', elapsed: 0 } : state
    case 'reset': // the take is gone (the page was hidden): back to the start
      return phase === 'unsupported' ? state : initialRecord(true)
  }
}

export type PlayPhase = 'idle' | 'starting' | 'playing'
export type PlayState = { phase: PlayPhase; failed: boolean }
export type PlayEvent = { type: 'press' | 'started' | 'ended' | 'fail' | 'cancel' }

export const initialPlay: PlayState = { phase: 'idle', failed: false }

export function playReducer(state: PlayState, event: PlayEvent): PlayState {
  switch (event.type) {
    case 'press':
      return { phase: state.phase === 'idle' ? 'starting' : 'idle', failed: false }
    case 'started':
      return state.phase === 'starting' ? { ...state, phase: 'playing' } : state
    case 'ended':
      return state.phase === 'idle' ? state : { ...state, phase: 'idle' }
    case 'fail':
      return state.phase === 'idle' ? state : { phase: 'idle', failed: true }
    case 'cancel':
      return initialPlay
  }
}

/** `m:ss`, as shown while recording. */
export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
