import * as links from './links'

const sources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.*', '!/src/test/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('links', () => {
  it('exports exactly the six addresses of the spec', () => {
    expect({ ...links }).toEqual({
      COCODE: 'https://cocode.dk',
      REPO: 'https://github.com/cocodedk/English-Danish-Lessons',
      ISSUES: 'https://github.com/cocodedk/English-Danish-Lessons/issues',
      LICENSE_URL: 'https://github.com/cocodedk/English-Danish-Lessons/blob/main/LICENSE',
      DDO: 'https://ordnet.dk/ddo',
      OFL: 'https://openfontlicense.org',
    })
  })

  it('mentions an address only in src/links.ts, apart from the SVG namespace', () => {
    for (const [file, text] of Object.entries(sources)) {
      const found = text.split('http://www.w3.org/2000/svg').join('').match(/https?:\/\//g) ?? []
      expect(found.length > 0, file).toBe(file === '/src/links.ts')
    }
  })

  it('opens a new tab only through ExternalLink', () => {
    for (const [file, text] of Object.entries(sources)) {
      if (file === '/src/components/ExternalLink.tsx') continue
      expect(text, file).not.toContain('_blank')
      const anchors = text.match(/<a\b[^>]*>/g) ?? []
      for (const anchor of anchors) expect(anchor, file).toContain('href="./llms.txt"')
    }
  })
})
