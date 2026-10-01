// Structure checks over the source and the built CSS (this one reads dist/, so build first).
import { readAll } from './test/files'

const sources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.*', '!/src/test/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const builtCss = await readAll('dist/assets', '.css')

const SVG_NS = 'http://www.w3.org/2000/svg'

describe('static app', () => {
  it('scans the source files', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20)
  })

  it('has no colour literal outside tokens.css', () => {
    for (const [file, text] of Object.entries(sources)) {
      expect(text, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(text, file).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/)
    }
  })

  it('makes no network request and mentions no web address but the SVG namespace and src/links.ts', () => {
    for (const [file, text] of Object.entries(sources)) {
      const cleaned = text.split(SVG_NS).join('')
      const addresses = file === '/src/links.ts' ? [] : ['http://', 'https://']
      for (const banned of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'indexedDB', ...addresses]) {
        expect(cleaned.includes(banned), `${file} mentions ${banned}`).toBe(false)
      }
    }
  })

  it('builds CSS with the reduced-motion block and both colour schemes', () => {
    const files = builtCss
    expect(files.length, 'dist/assets has no CSS: run npm run build first').toBeGreaterThan(0)
    const css = files.join('\n')
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
    expect(css).toMatch(/color-scheme:\s*light/)
    expect(css).toMatch(/color-scheme:\s*dark/)
    expect(css).toMatch(/prefers-color-scheme:\s*dark/)
  })
})
