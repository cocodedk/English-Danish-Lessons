import { act, fireEvent, screen } from '@testing-library/react'
import { getLesson } from '../catalog'
import { lightEntry } from '../storage/stores'
import { call, PAGES, stored, where } from '../test/mcpCalls'
import { ENTRY_IDS, renderAt, seedProgress } from '../test/render'
import { installSpeech, voice } from '../test/speech'
import { installModelContext } from '../test/webmcp'

const entries = getLesson('hej-og-tak')!.entries

describe('webmcp', () => {
  it('registers each tool on its own page only, and describe answers for that page', async () => {
    const reg = installModelContext()
    for (const [page, path, tools] of PAGES) {
      const { unmount } = renderAt(path)
      expect(reg.names(), path).toEqual(['describe', ...tools].sort())
      expect(await call(reg, 'describe')).toEqual({
        page,
        summary: expect.any(String),
        tools: ['describe', ...tools],
      })
      unmount()
      expect(reg.names()).toEqual([])
    }
    expect(reg.signals.length).toBeGreaterThan(0)
    expect(reg.signals.every((s) => s.aborted)).toBe(true)
  })

  it('answers the home tools in their exact shapes, from live state', async () => {
    const reg = installModelContext()
    renderAt('/')
    const street = {
      name: null,
      windowsLit: 0,
      windowsTotal: 46,
      storage: 'saved',
      lessons: [
        { id: 'hej-og-tak', title: 'Hej og tak', titleEn: 'Hello and thanks', lit: 0, total: 8, done: false },
        { id: 'hvem-er-du', title: 'Hvem er du?', titleEn: 'Who are you?', lit: 0, total: 8, done: false },
        { id: 'tal', title: 'Tal', titleEn: 'Numbers', lit: 0, total: 10, done: false },
        { id: 'mad-og-drikke', title: 'Mad og drikke', titleEn: 'Food and drink', lit: 0, total: 10, done: false },
        { id: 'byen', title: 'Byen', titleEn: 'The city', lit: 0, total: 10, done: false },
      ],
      next: { lessonId: 'hej-og-tak', position: 1, da: 'Hej', en: 'Hello' },
    }
    expect(await call(reg, 'get_street')).toEqual(street)
    act(() => lightEntry('hej-og-tak', 'hej'))
    expect(await call(reg, 'get_street')).toMatchObject({
      windowsLit: 1,
      next: { position: 2, da: 'Goddag', en: 'Good day' },
    })
    expect(await call(reg, 'open_lesson', { lessonId: 'hej-og-tak', position: 3 })).toEqual({
      ok: true,
      page: 'lesson',
      lessonId: 'hej-og-tak',
      position: 3,
    })
    expect(where()).toBe('/lesson/hej-og-tak/3')
  })

  it('answers the lesson tools in their exact shapes', async () => {
    const reg = installModelContext()
    renderAt('/lesson/hej-og-tak/1')
    expect(await call(reg, 'get_entry')).toEqual({
      lessonId: 'hej-og-tak',
      position: 1,
      total: 8,
      da: 'Hej',
      en: 'Hello',
      respelling: 'hi',
      ipa: entries[0].ipa,
      note: entries[0].note,
      lit: false,
      voice: 'unsupported',
      speaking: false,
    })
    expect(await call(reg, 'hear_entry')).toEqual({ ok: false, started: false, reason: 'unsupported' })
    expect(await call(reg, 'mark_said')).toEqual({ ok: true, lit: true, windowsLit: 1, windowsTotal: 46 })
    expect((await call(reg, 'get_entry')).lit).toBe(true)
    expect(await call(reg, 'go_to', { where: 'next' })).toEqual({ ok: true, page: 'lesson', position: 2 })
    expect(where()).toBe('/lesson/hej-og-tak/2')
    expect(await call(reg, 'go_to', { where: 'back' })).toEqual({ ok: true, page: 'lesson', position: 1 })
  })

  it('finishes from the last entry, and starts speech from hear_entry', async () => {
    installSpeech([voice('da-DK')])
    const reg = installModelContext()
    renderAt('/lesson/hej-og-tak/8')
    expect(await call(reg, 'hear_entry')).toEqual({ ok: true, started: true })
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
    expect(await call(reg, 'go_to', { where: 'finish' })).toEqual({ ok: true, page: 'done' })
    expect(where()).toBe('/lesson/hej-og-tak/done')
  })

  it('stops speech on a second hear_entry, as a second press of the button does', async () => {
    installSpeech([voice('da-DK')])
    const reg = installModelContext()
    renderAt('/lesson/hej-og-tak/1')
    await call(reg, 'hear_entry')
    expect((await call(reg, 'get_entry')).speaking).toBe(true)
    expect(await call(reg, 'hear_entry')).toEqual({ ok: true, started: false })
    expect((await call(reg, 'get_entry')).speaking).toBe(false)
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
  })

  it('lights the window the same way from the button and from mark_said', async () => {
    const first = renderAt('/lesson/hej-og-tak/2')
    fireEvent.click(screen.getByRole('button', { name: 'I said it' }))
    const viaButton = stored()
    first.unmount()
    localStorage.clear()
    const reg = installModelContext()
    renderAt('/lesson/hej-og-tak/2')
    await call(reg, 'mark_said')
    expect(stored()).toEqual(viaButton)
    expect(stored()).toEqual(['goddag'])
  })

  it('answers the done tools in their exact shapes', async () => {
    seedProgress(ENTRY_IDS)
    const reg = installModelContext()
    renderAt('/lesson/hej-og-tak/done')
    expect(await call(reg, 'get_result')).toEqual({
      lessonId: 'hej-og-tak',
      lit: 8,
      total: 8,
      allLit: true,
      praise: { da: 'Velkommen', en: 'Welcome' },
    })
    expect(await call(reg, 'go_from_done', { where: 'practise' })).toEqual({ ok: true, page: 'lesson' })
    expect(where()).toBe('/lesson/hej-og-tak/1')
  })

  it('goes to the street, and to the first unlit entry or entry 1, from the done page', async () => {
    seedProgress(['hej', 'goddag'])
    const reg = installModelContext()
    const first = renderAt('/lesson/hej-og-tak/done')
    expect(await call(reg, 'go_from_done', { where: 'street' })).toEqual({ ok: true, page: 'home' })
    expect(where()).toBe('/')
    first.unmount()
    const second = renderAt('/lesson/hej-og-tak/done')
    expect(await call(reg, 'go_from_done', { where: 'light_the_rest' })).toEqual({ ok: true, page: 'lesson' })
    expect(where()).toBe('/lesson/hej-og-tak/3')
    second.unmount()
    localStorage.clear()
    renderAt('/lesson/hej-og-tak/done')
    await call(reg, 'go_from_done', { where: 'light_the_rest' })
    expect(where()).toBe('/lesson/hej-og-tak/1')
  })

  it('answers the settings tools in their exact shapes', async () => {
    seedProgress(['hej', 'tak'])
    const reg = installModelContext()
    renderAt('/me')
    expect(await call(reg, 'get_settings')).toEqual({
      name: null,
      colorMode: 'auto',
      windowsLit: 2,
      windowsTotal: 46,
      storage: 'saved',
    })
    expect(await call(reg, 'set_name', { name: '  Sam ' })).toEqual({ ok: true, name: 'Sam' })
    expect((await call(reg, 'get_settings')).name).toBe('Sam')
    expect(await call(reg, 'clear_name')).toEqual({ ok: true })
    expect((await call(reg, 'get_settings')).name).toBeNull()
    expect(await call(reg, 'set_color_mode', { mode: 'dark' })).toEqual({ ok: true, colorMode: 'dark' })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(await call(reg, 'delete_progress', { confirm: true })).toEqual({ ok: true })
    expect(stored()).toBeUndefined()
  })

  it('goes to the street from Not found', async () => {
    const reg = installModelContext()
    renderAt('/nowhere')
    expect(await call(reg, 'go_to_street')).toEqual({ ok: true, page: 'home' })
    expect(where()).toBe('/')
  })
})
