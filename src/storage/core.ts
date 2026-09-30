// The only module that touches localStorage. It never throws: when storage does not
// work it keeps everything in memory for the life of the page.
export const KEY_PREFIX = 'edl.v1.'

const memory = new Map<string, string>()
const listeners = new Set<() => void>()
let persistent: boolean | undefined

function probe(): boolean {
  try {
    const key = `${KEY_PREFIX}probe`
    localStorage.setItem(key, '1')
    const ok = localStorage.getItem(key) === '1'
    localStorage.removeItem(key)
    return ok
  } catch {
    return false
  }
}

export function isPersistent(): boolean {
  if (persistent === undefined) persistent = probe()
  return persistent
}

function notify(): void {
  listeners.forEach((fn) => fn())
}

/** Forget the probe result and the in-memory map (tests, and nothing else). */
export function resetStorage(): void {
  persistent = undefined
  memory.clear()
  notify()
}

// The memory map mirrors every value read or written, so if storage fails part-way through
// the session nothing the learner already saved disappears.
export function readRaw(key: string): string | null {
  if (isPersistent()) {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) memory.delete(key)
      else memory.set(key, raw)
      return raw
    } catch {
      persistent = false
    }
  }
  return memory.get(key) ?? null
}

export function writeRaw(key: string, raw: string): void {
  memory.set(key, raw)
  if (isPersistent()) {
    try {
      localStorage.setItem(key, raw)
    } catch {
      persistent = false
    }
  }
  notify()
}

export function removeRaw(key: string): void {
  memory.delete(key)
  if (isPersistent()) {
    try {
      localStorage.removeItem(key)
    } catch {
      persistent = false
    }
  }
  notify()
}

export function subscribe(fn: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(KEY_PREFIX)) fn()
  }
  listeners.add(fn)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('storage', onStorage)
  }
}

export type Envelope<T> = { schemaVersion: 1; value: T }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export { isRecord }

/** One small store per key: parse returns undefined for a wrong shape, which reads as the fallback. */
export function createStore<T>(key: string, fallback: T, parse: (value: unknown) => T | undefined) {
  let lastRaw: string | null | undefined
  let lastValue: T = fallback

  function decode(raw: string | null): T {
    if (raw === null) return fallback
    try {
      const envelope: unknown = JSON.parse(raw)
      if (isRecord(envelope) && envelope.schemaVersion === 1) return parse(envelope.value) ?? fallback
    } catch {
      // unparsable data reads as the default
    }
    return fallback
  }

  return {
    get(): T {
      const raw = readRaw(key)
      if (raw !== lastRaw) {
        lastRaw = raw
        lastValue = decode(raw)
      }
      return lastValue
    },
    set(value: T): void {
      const envelope: Envelope<T> = { schemaVersion: 1, value }
      writeRaw(key, JSON.stringify(envelope))
    },
    clear(): void {
      removeRaw(key)
    },
  }
}
