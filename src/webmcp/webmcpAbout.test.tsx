import { BUILD_DATE } from '../about/buildInfo'
import { call } from '../test/mcpCalls'
import { renderAt } from '../test/render'
import { installModelContext } from '../test/webmcp'

const ABOUT = {
  madeBy: 'Babak',
  site: 'https://cocode.dk',
  firstPublished: '2026-09-30',
  updated: BUILD_DATE,
  source: 'https://github.com/cocodedk/English-Danish-Lessons',
  license: 'Apache-2.0',
  danishSource: 'Den Danske Ordbog (ordnet.dk)',
  draft: true,
  privacy: 'browser-only',
}

describe('webmcp about', () => {
  it('answers get_about in its exact shape for {}, [], extra keys and wrong types, and never throws', async () => {
    const reg = installModelContext()
    renderAt('/about')
    for (const input of [{}, [], { extra: 1 }, { updated: 5 }, 'x', 7, null, undefined]) {
      expect(await call(reg, 'get_about', input), JSON.stringify(input)).toEqual(ABOUT)
    }
    expect(BUILD_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('registers get_about on the About page only, where describe says about', async () => {
    const reg = installModelContext()
    for (const path of ['/', '/sounds', '/me', '/nowhere', '/lesson/hej-og-tak/1']) {
      const view = renderAt(path)
      expect(reg.names(), path).not.toContain('get_about')
      view.unmount()
    }
    renderAt('/about')
    expect(reg.names()).toEqual(['describe', 'get_about'])
    expect(reg.tools.get('get_about')?.annotations).toEqual({ readOnlyHint: true })
    expect(await call(reg, 'describe')).toEqual({
      page: 'about',
      summary: 'About Hej.: who made it and when, where the Danish comes from, what is stored, and what it is built with.',
      tools: ['describe', 'get_about'],
    })
  })
})
