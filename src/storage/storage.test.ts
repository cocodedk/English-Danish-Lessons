import { isPersistent, resetStorage } from './core'
import {
  MAX_NAME_LENGTH,
  clearName,
  clearProgress,
  countLit,
  firstUnlit,
  lightEntry,
  prefsStore,
  profileStore,
  progressStore,
  setColorMode,
  setName,
  validateName,
} from './stores'

const envelope = (value: unknown) => JSON.stringify({ schemaVersion: 1, value })

describe('storage', () => {
  it('round-trips profile, progress and prefs in the envelope', () => {
    setName('Sam')
    lightEntry('hej-og-tak', 'tak')
    setColorMode('dark')
    expect(profileStore.get()).toEqual({ name: 'Sam' })
    expect(progressStore.get()).toEqual({ lit: { 'hej-og-tak': ['tak'] } })
    expect(prefsStore.get()).toEqual({ colorMode: 'dark' })
    expect(JSON.parse(localStorage.getItem('edl.v1.profile')!)).toEqual({ schemaVersion: 1, value: { name: 'Sam' } })
    expect(isPersistent()).toBe(true)
  })

  it('reads absent, corrupt, wrong-schema and wrong-shape data as defaults without repairing it', () => {
    expect(profileStore.get().name).toBe('')
    expect(prefsStore.get().colorMode).toBe('auto')
    localStorage.setItem('edl.v1.profile', '{not json')
    localStorage.setItem('edl.v1.progress', JSON.stringify({ schemaVersion: 2, value: { lit: { 'hej-og-tak': ['hej'] } } }))
    localStorage.setItem('edl.v1.prefs', envelope({ colorMode: 'purple' }))
    expect(profileStore.get().name).toBe('')
    expect(progressStore.get()).toEqual({ lit: {} })
    expect(prefsStore.get().colorMode).toBe('auto')
    expect(localStorage.getItem('edl.v1.profile')).toBe('{not json')
    localStorage.setItem('edl.v1.progress', envelope({ lit: 'nope' }))
    expect(countLit(progressStore.get())).toBe(0)
  })

  it('falls back to memory when storage throws, and says so', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    resetStorage()
    expect(isPersistent()).toBe(false)
    setName('Kim')
    lightEntry('hej-og-tak', 'hej')
    expect(profileStore.get().name).toBe('Kim')
    expect(countLit(progressStore.get())).toBe(1)
  })

  it('keeps what was saved when storage starts failing part-way through the session', () => {
    setName('Sam')
    lightEntry('hej-og-tak', 'hej')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(profileStore.get().name).toBe('Sam')
    expect(isPersistent()).toBe(false)
    lightEntry('hej-og-tak', 'tak')
    expect(progressStore.get()).toEqual({ lit: { 'hej-og-tak': ['hej', 'tak'] } })
  })

  it('falls back to memory when only setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    resetStorage()
    expect(isPersistent()).toBe(false)
    setName('Kim')
    expect(profileStore.get().name).toBe('Kim')
    expect(localStorage.getItem('edl.v1.profile')).toBeNull()
  })

  it('removes the profile key instead of storing an empty name', () => {
    setName('Sam')
    clearName()
    expect(localStorage.getItem('edl.v1.profile')).toBeNull()
    expect(profileStore.get().name).toBe('')
  })

  it('drops unknown entry ids and unknown lessons on read, and keeps ids unique', () => {
    localStorage.setItem(
      'edl.v1.progress',
      envelope({ lit: { 'hej-og-tak': ['tak', 'tak', 'ghost', 7], 'other-lesson': ['hej'] } }),
    )
    expect(progressStore.get()).toEqual({ lit: { 'hej-og-tak': ['tak'] } })
  })

  it('finds the first unlit entry, lights each entry once, and clears', () => {
    expect(firstUnlit(progressStore.get(), 'hej-og-tak')?.position).toBe(1)
    lightEntry('hej-og-tak', 'hej')
    lightEntry('hej-og-tak', 'hej')
    expect(countLit(progressStore.get())).toBe(1)
    expect(firstUnlit(progressStore.get(), 'hej-og-tak')?.entry.id).toBe('goddag')
    clearProgress()
    expect(countLit(progressStore.get())).toBe(0)
  })

  it('validates names: trimmed, 1 to 24 characters by code point, no control characters', () => {
    expect(validateName('  Sam  ')).toEqual({ ok: true, name: 'Sam' })
    expect(validateName('   ')).toEqual({ ok: false, error: null })
    expect(validateName('a'.repeat(MAX_NAME_LENGTH))).toMatchObject({ ok: true })
    expect(validateName('a'.repeat(MAX_NAME_LENGTH + 1))).toEqual({ ok: false, error: 'Use 24 characters or fewer.' })
    expect(validateName('😀'.repeat(24))).toMatchObject({ ok: true })
    expect(validateName('😀'.repeat(25))).toMatchObject({ ok: false })
    const bad = { ok: false, error: "That name has a character we can't save. Remove it and try again." }
    expect(validateName('Sa\u0007m')).toEqual(bad)
    expect(validateName('Sam\n')).toEqual(bad)
    expect(validateName('\tSam')).toEqual(bad)
  })

  it('reads a stored name that breaks the rules as no name', () => {
    localStorage.setItem('edl.v1.profile', envelope({ name: 'a'.repeat(30) }))
    expect(profileStore.get().name).toBe('')
    localStorage.setItem('edl.v1.profile', envelope({ name: '  Sam ' }))
    expect(profileStore.get().name).toBe('Sam')
  })
})
