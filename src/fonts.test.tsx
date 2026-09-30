// The IPA font: a token, a component that uses it, and only the two Latin subsets in the build.
import { screen } from '@testing-library/react'
import { getLesson } from './catalog'
import { readAll, readText } from './test/files'
import { renderAt } from './test/render'

const builtCss = (await readAll('dist/assets', '.css')).join('\n')
const classes = (el: Element) => Array.from(el.classList)

describe('ipa font', () => {
  it('sets the pronunciation IPA in the fonts.ipa family at weight 400', async () => {
    const tokens = await readText('src/styles/tokens.stylex.ts')
    expect(tokens).toMatch(/ipa: "'Noto Sans Variable', system-ui, sans-serif"/)
    expect(builtCss, 'dist has no CSS: run npm run build first').not.toBe('')
    renderAt('/lesson/hvem-er-du/3')
    const ipa = screen.getByText(getLesson('hvem-er-du')!.entries[2].ipa)
    const rule = (cls: string, prop: string) => builtCss.match(new RegExp(`\\.${cls}[^{]*\\{\\s*${prop}:\\s*([^;}]+)`))?.[1]
    const family = classes(ipa).map((c) => rule(c, 'font-family')).find(Boolean)
    const variable = family?.match(/^var\((--[\w-]+)\)$/)?.[1]
    expect(variable, 'the IPA element has a font-family from fonts.ipa').toBeDefined()
    expect(builtCss).toContain(`${variable}: "Noto Sans Variable", system-ui, sans-serif`)
    expect(classes(ipa).map((c) => rule(c, 'font-weight'))).toContain('400')
  })

  it('imports only the latin and latin-ext files, never the package index', async () => {
    const main = await readText('src/main.tsx')
    expect(main).toContain("import './styles/noto-sans-latin.css'")
    expect(main).toContain("import './styles/noto-sans-latin-ext.css'")
    expect(main).not.toMatch(/@fontsource-variable\/noto-sans/)
    for (const subset of ['latin', 'latin-ext']) {
      const css = await readText(`src/styles/noto-sans-${subset}.css`)
      expect(css).toContain("font-family: 'Noto Sans Variable'")
      expect(css).toContain(`files/noto-sans-${subset}-wght-normal.woff2`)
    }
  })

  it('builds an @font-face for Noto Sans Variable and none for another script', () => {
    expect(builtCss, 'dist has no CSS: run npm run build first').not.toBe('')
    const faces = builtCss.match(/@font-face\{[^}]*\}/g) ?? []
    const noto = faces.filter((f) => f.includes('Noto Sans Variable'))
    expect(noto.length).toBeGreaterThan(0)
    expect(noto.join('')).toMatch(/noto-sans-latin-wght-normal/)
    expect(noto.join('')).toMatch(/noto-sans-latin-ext-wght-normal/)
    expect(noto.join('')).not.toMatch(/cyrillic|greek|vietnamese|devanagari/)
  })
})
