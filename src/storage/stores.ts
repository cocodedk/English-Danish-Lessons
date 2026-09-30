import { getLesson, lessons } from '../catalog'
import { createStore, isRecord } from './core'

export const MAX_NAME_LENGTH = 24

export const NAME_TOO_LONG = 'Use 24 characters or fewer.'
export const NAME_BAD_CHARACTER = "That name has a character we can't save. Remove it and try again."

export type NameCheck = { ok: true; name: string } | { ok: false; error: string | null }

const isControl = (c: string) => {
  const n = c.codePointAt(0) ?? 0
  return n < 32 || (n >= 127 && n < 160)
}

/** No control characters (checked before trimming, so "Sam\n" is refused), then trim to 1..24 code points. */
export function validateName(input: string): NameCheck {
  if (Array.from(input).some(isControl)) return { ok: false, error: NAME_BAD_CHARACTER }
  const name = input.trim()
  const chars = Array.from(name)
  if (chars.length === 0) return { ok: false, error: null }
  if (chars.length > MAX_NAME_LENGTH) return { ok: false, error: NAME_TOO_LONG }
  return { ok: true, name }
}

export type Profile = { name: string }
const NO_PROFILE: Profile = { name: '' }

export const profileStore = createStore<Profile>('edl.v1.profile', NO_PROFILE, (v) => {
  if (!isRecord(v) || typeof v.name !== 'string') return undefined
  const check = validateName(v.name)
  return check.ok ? { name: check.name } : NO_PROFILE
})

export type Progress = { lit: Record<string, string[]> }
const NO_PROGRESS: Progress = { lit: {} }

export const progressStore = createStore<Progress>('edl.v1.progress', NO_PROGRESS, (v) => {
  if (!isRecord(v) || !isRecord(v.lit)) return undefined
  const lit: Record<string, string[]> = {}
  for (const lesson of lessons) {
    const stored = v.lit[lesson.id]
    if (!Array.isArray(stored)) continue
    const ids = lesson.entries.map((e) => e.id).filter((id) => stored.includes(id))
    if (ids.length > 0) lit[lesson.id] = ids
  }
  return { lit }
})

export type ColorMode = 'auto' | 'light' | 'dark'
export const COLOR_MODES: readonly ColorMode[] = ['auto', 'light', 'dark']
const DEFAULT_PREFS: { colorMode: ColorMode } = { colorMode: 'auto' }

export const prefsStore = createStore('edl.v1.prefs', DEFAULT_PREFS, (v) => {
  if (!isRecord(v)) return undefined
  return COLOR_MODES.find((m) => m === v.colorMode) ? { colorMode: v.colorMode as ColorMode } : undefined
})

export function litIds(progress: Progress, lessonId: string): readonly string[] {
  return progress.lit[lessonId] ?? []
}

export function countLit(progress: Progress): number {
  return lessons.reduce((n, l) => n + litIds(progress, l.id).length, 0)
}

/** The first entry of the lesson that is not lit yet, or undefined when all are (or the lesson is unknown). */
export function firstUnlit(progress: Progress, lessonId: string) {
  const lit = litIds(progress, lessonId)
  const entries = getLesson(lessonId)?.entries ?? []
  const index = entries.findIndex((e) => !lit.includes(e.id))
  return index < 0 ? undefined : { entry: entries[index], position: index + 1 }
}

export function lightEntry(lessonId: string, entryId: string): void {
  const progress = progressStore.get()
  const lit = litIds(progress, lessonId)
  if (lit.includes(entryId)) return
  progressStore.set({ lit: { ...progress.lit, [lessonId]: [...lit, entryId] } })
}

export function clearProgress(): void {
  progressStore.set(NO_PROGRESS)
}

export function setName(name: string): void {
  profileStore.set({ name })
}

/** Removes the stored profile: an empty name is not a valid stored value. */
export function clearName(): void {
  profileStore.clear()
}

export function setColorMode(colorMode: ColorMode): void {
  prefsStore.set({ colorMode })
}
