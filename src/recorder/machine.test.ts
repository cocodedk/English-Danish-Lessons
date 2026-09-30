import {
  clock,
  errorPhase,
  initialPlay,
  initialRecord,
  LIMIT_SECONDS,
  playReducer,
  recordReducer,
  type PlayEvent,
  type PlayState,
  type RecordEvent,
  type RecordPhase,
  type RecordState,
} from './machine'

const run = (state: RecordState, ...events: RecordEvent[]) => events.reduce(recordReducer, state)
const at = (phase: RecordPhase, elapsed = 0): RecordState => ({ phase, elapsed })
const play = (state: PlayState, ...events: PlayEvent['type'][]) =>
  events.reduce((s, type) => playReducer(s, { type }), state)

describe('record machine', () => {
  it('goes idle, asking, recording, finishing, recorded and asks again from recorded', () => {
    expect(initialRecord(true)).toEqual(at('idle'))
    expect(run(initialRecord(true), { type: 'ask' })).toEqual(at('asking'))
    expect(run(at('asking'), { type: 'granted' })).toEqual(at('recording'))
    expect(run(at('recording', 7), { type: 'stop' })).toEqual(at('finishing', 7))
    expect(run(at('finishing', 7), { type: 'data', bytes: 3 })).toEqual(at('recorded', 7))
    expect(run(at('recorded', 7), { type: 'ask' })).toEqual(at('asking'))
    expect(run(at('recording'), { type: 'tick' }, { type: 'tick' })).toEqual(at('recording', 2))
    const stray: [RecordPhase, RecordEvent][] = [
      ['idle', { type: 'stop' }],
      ['idle', { type: 'granted' }],
      ['idle', { type: 'data', bytes: 1 }],
      ['asking', { type: 'ask' }],
      ['recording', { type: 'ask' }],
      ['finishing', { type: 'ask' }],
      ['finishing', { type: 'tick' }],
      ['recorded', { type: 'stop' }],
    ]
    for (const [phase, event] of stray) expect(run(at(phase, 3), event), `${phase} ${event.type}`).toEqual(at(phase, 3))
  })

  it('maps a refusal, a missing device and anything else to denied, no-microphone and failed', () => {
    const cases: [string | undefined, RecordPhase][] = [
      ['NotAllowedError', 'denied'],
      ['SecurityError', 'denied'],
      ['NotFoundError', 'no-microphone'],
      ['OverconstrainedError', 'no-microphone'],
      ['NotReadableError', 'failed'],
      ['AbortError', 'failed'],
      [undefined, 'failed'],
    ]
    for (const [name, phase] of cases) {
      expect(errorPhase(name), String(name)).toBe(phase)
      expect(run(at('asking'), { type: 'error', name }), String(name)).toEqual(at(phase))
    }
    expect(run(at('idle'), { type: 'error', name: 'NotAllowedError' })).toEqual(at('idle'))
    for (const phase of ['denied', 'no-microphone', 'failed'] as const) {
      expect(run(at(phase), { type: 'ask' }), phase).toEqual(at('asking'))
    }
  })

  it('stops by itself at the 20 second limit and not before', () => {
    expect(LIMIT_SECONDS).toBe(20)
    const ticks = (n: number) => Array.from({ length: n }, (): RecordEvent => ({ type: 'tick' }))
    expect(run(at('recording'), ...ticks(19))).toEqual(at('recording', 19))
    expect(run(at('recording'), ...ticks(20))).toEqual(at('finishing', 20))
    expect(run(at('recording'), ...ticks(25))).toEqual(at('finishing', 20))
  })

  it('ends an empty take in failed, and a failing recorder in failed', () => {
    expect(run(at('finishing', 4), { type: 'data', bytes: 0 })).toEqual(at('failed', 4))
    for (const phase of ['asking', 'recording', 'finishing'] as const) {
      expect(run(at(phase, 2), { type: 'fail' }), phase).toEqual(at('failed'))
    }
    expect(run(at('idle'), { type: 'fail' })).toEqual(at('idle'))
    expect(run(at('recorded', 2), { type: 'fail' })).toEqual(at('recorded', 2))
  })

  it('stays unsupported whatever happens', () => {
    const events: RecordEvent[] = [
      { type: 'ask' },
      { type: 'granted' },
      { type: 'error', name: 'NotAllowedError' },
      { type: 'tick' },
      { type: 'stop' },
      { type: 'data', bytes: 5 },
      { type: 'fail' },
      { type: 'reset' },
    ]
    expect(initialRecord(false)).toEqual(at('unsupported'))
    expect(run(initialRecord(false), ...events)).toEqual(at('unsupported'))
    for (const phase of ['asking', 'recording', 'finishing', 'recorded', 'denied', 'failed'] as const) {
      expect(run(at(phase, 5), { type: 'reset' }), phase).toEqual(at('idle'))
    }
  })

  it('formats the clock as m:ss', () => {
    expect([0, 7, 20, 59, 60, 75].map(clock)).toEqual(['0:00', '0:07', '0:20', '0:59', '1:00', '1:15'])
  })
})

describe('playback machine', () => {
  it('goes idle, starting, playing and back to idle on end', () => {
    expect(initialPlay).toEqual({ phase: 'idle', failed: false })
    expect(play(initialPlay, 'press')).toEqual({ phase: 'starting', failed: false })
    expect(play(initialPlay, 'press', 'started')).toEqual({ phase: 'playing', failed: false })
    expect(play(initialPlay, 'press', 'started', 'ended')).toEqual(initialPlay)
    expect(play(initialPlay, 'started')).toEqual(initialPlay)
  })

  it('cancels while starting or playing, and ignores a late answer after the cancel', () => {
    expect(play(initialPlay, 'press', 'press')).toEqual(initialPlay)
    expect(play(initialPlay, 'press', 'started', 'press')).toEqual(initialPlay)
    expect(play(initialPlay, 'press', 'cancel', 'started')).toEqual(initialPlay)
    expect(play(initialPlay, 'press', 'cancel', 'fail')).toEqual(initialPlay)
  })

  it('records a failure, keeps it until the next press and never while idle', () => {
    expect(play(initialPlay, 'press', 'fail')).toEqual({ phase: 'idle', failed: true })
    expect(play(initialPlay, 'press', 'started', 'fail')).toEqual({ phase: 'idle', failed: true })
    expect(play(initialPlay, 'press', 'fail', 'press')).toEqual({ phase: 'starting', failed: false })
    expect(play(initialPlay, 'press', 'fail', 'cancel')).toEqual(initialPlay)
    expect(play(initialPlay, 'fail')).toEqual(initialPlay)
  })
})
