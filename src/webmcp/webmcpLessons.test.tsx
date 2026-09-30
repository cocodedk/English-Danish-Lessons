// The WebMCP tools with more than one lesson in the catalog.
import { call, where } from '../test/mcpCalls'
import { ENTRY_IDS, ENTRY_IDS_2, renderAt, seedName, seedProgress } from '../test/render'
import { installModelContext } from '../test/webmcp'

describe('webmcp with two lessons', () => {
  it('points next at lesson 2 when lesson 1 is lit, and at nothing when every window is lit', async () => {
    seedProgress(ENTRY_IDS)
    seedName('Sam')
    const reg = installModelContext()
    const first = renderAt('/')
    expect(await call(reg, 'get_street')).toMatchObject({
      windowsLit: 8,
      lessons: [{ lit: 8, total: 8, done: true }, { id: 'hvem-er-du', lit: 0, total: 8, done: false }],
      next: { lessonId: 'hvem-er-du', position: 1, da: 'Jeg', en: 'I' },
    })
    first.unmount()
    seedProgress([], { 'hej-og-tak': ENTRY_IDS, 'hvem-er-du': ENTRY_IDS_2 })
    renderAt('/')
    expect(await call(reg, 'get_street')).toMatchObject({
      name: 'Sam',
      windowsLit: 16,
      lessons: [{ lit: 8, total: 8, done: true }, { lit: 8, total: 8, done: true }],
      next: null,
    })
  })

  it('opens lesson 2, and lists both ids on a bad id', async () => {
    const reg = installModelContext()
    const view = renderAt('/')
    expect(await call(reg, 'open_lesson', { lessonId: 'hvem-er-du' })).toEqual({
      ok: true,
      page: 'lesson',
      lessonId: 'hvem-er-du',
      position: 1,
    })
    expect(where()).toBe('/lesson/hvem-er-du/1')
    view.unmount()
    renderAt('/')
    expect(await call(reg, 'open_lesson', { lessonId: 'nope' })).toMatchObject({
      ok: false,
      lessonIds: ['hej-og-tak', 'hvem-er-du'],
    })
  })

  it('answers the done tools for lesson 2', async () => {
    seedProgress([], { 'hvem-er-du': ENTRY_IDS_2.slice(0, 5) })
    const reg = installModelContext()
    const view = renderAt('/lesson/hvem-er-du/done')
    expect(await call(reg, 'get_result')).toEqual({
      lessonId: 'hvem-er-du',
      lit: 5,
      total: 8,
      allLit: false,
      praise: { da: 'Flot', en: 'Well done' },
    })
    expect(await call(reg, 'go_from_done', { where: 'light_the_rest' })).toEqual({ ok: true, page: 'lesson' })
    expect(where()).toBe('/lesson/hvem-er-du/6')
    view.unmount()
    renderAt('/lesson/hvem-er-du/done')
    expect(await call(reg, 'go_from_done', { where: 'practise' })).toEqual({ ok: true, page: 'lesson' })
    expect(where()).toBe('/lesson/hvem-er-du/1')
  })

  it('describes Home as one house per lesson', async () => {
    const reg = installModelContext()
    renderAt('/')
    expect((await call(reg, 'describe')).summary).toBe(
      'Your street: one house per lesson with its lit windows, and a card that continues the next lesson.',
    )
  })
})
