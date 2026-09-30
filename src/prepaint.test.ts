import { readText } from './test/files'

const html = await readText('index.html')

// The inline script from index.html itself, run as written.
const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? ''
const run = () => new Function(script)()
const seed = (value: unknown) => localStorage.setItem('edl.v1.prefs', JSON.stringify(value))
const theme = () => document.documentElement.getAttribute('data-theme')

describe('pre-paint script', () => {
  it('sets data-theme for dark and light', () => {
    expect(script).not.toBe('')
    seed({ schemaVersion: 1, value: { colorMode: 'dark' } })
    run()
    expect(theme()).toBe('dark')
    seed({ schemaVersion: 1, value: { colorMode: 'light' } })
    run()
    expect(theme()).toBe('light')
  })

  it('sets nothing for auto, missing, corrupt or wrong-schema data', () => {
    run()
    expect(theme()).toBeNull()
    seed({ schemaVersion: 1, value: { colorMode: 'auto' } })
    run()
    expect(theme()).toBeNull()
    localStorage.setItem('edl.v1.prefs', '{broken')
    run()
    expect(theme()).toBeNull()
    seed({ schemaVersion: 2, value: { colorMode: 'dark' } })
    run()
    expect(theme()).toBeNull()
  })

  it('does not throw when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(run).not.toThrow()
    expect(theme()).toBeNull()
  })
})
