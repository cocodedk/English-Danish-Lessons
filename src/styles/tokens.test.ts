import { readText } from '../test/files'

const css = await readText('src/styles/tokens.css')

const TABLE: Record<string, [string, string]> = {
  sky: ['#E5ECF1', '#0B1730'],
  paper: ['#F8FAFB', '#13223D'],
  ink: ['#14233B', '#EDF2F7'],
  'ink-soft': ['#485A72', '#A9B8CB'],
  line: ['#C3CFD9', '#2A3B58'],
  edge: ['#6A7F96', '#61789A'],
  fjord: ['#1D4E85', '#8DB8EE'],
  'on-fjord': ['#F8FAFB', '#0B1730'],
  lamp: ['#F4B63A', '#FFC65A'],
  'window-off': ['#33465F', '#1C2E4E'],
  'window-frame': ['#F8FAFB', '#0B1730'],
  ground: ['#14233B', '#3A4E70'],
  flag: ['#C8102E', '#F0546D'],
  gul: ['#EBB94A', '#B58A2A'],
  'on-gul': ['#14233B', '#0B1730'],
  tegl: ['#A5402D', '#8E3626'],
  'on-tegl': ['#F8FAFB', '#EDF2F7'],
  hav: ['#2E7291', '#2A6580'],
  'on-hav': ['#F8FAFB', '#EDF2F7'],
  salvie: ['#93B08C', '#4A664A'],
  'on-salvie': ['#14233B', '#F1F5F0'],
  rosa: ['#DA9C9A', '#B98283'],
  'on-rosa': ['#14233B', '#0B1730'],
}

/** The custom properties declared in the rule that starts at `selector`. */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector)
  expect(start, `${selector} is in tokens.css`).toBeGreaterThanOrEqual(0)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  const out: Record<string, string> = {}
  for (const [, name, value] of body.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6});/g)) out[name] = value.toUpperCase()
  return out
}

const light = () => block(':root {')
const dark = () => block(":root[data-theme='dark'] {")
const auto = () => block(":root:not([data-theme='light']) {")

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const TEXT_PAIRS = [
  ['ink', 'sky'], ['ink', 'paper'], ['ink-soft', 'sky'], ['ink-soft', 'paper'], ['on-fjord', 'fjord'],
  ['on-gul', 'gul'], ['on-tegl', 'tegl'], ['on-hav', 'hav'], ['on-salvie', 'salvie'], ['on-rosa', 'rosa'],
]
const GRAPHIC_PAIRS = [['fjord', 'sky'], ['fjord', 'paper'], ['edge', 'sky'], ['edge', 'paper'], ['lamp', 'window-off']]

describe('tokens', () => {
  it('declares every token of the table in the light, dark and auto blocks with the table values', () => {
    const light_ = Object.fromEntries(Object.entries(TABLE).map(([k, v]) => [k, v[0]]))
    const dark_ = Object.fromEntries(Object.entries(TABLE).map(([k, v]) => [k, v[1]]))
    expect(light()).toEqual(light_)
    expect(dark()).toEqual(dark_)
    expect(auto()).toEqual(dark_)
    expect(css).toContain('color-scheme: light')
    expect(css).toContain('color-scheme: dark')
    expect(css).toContain('@media (prefers-color-scheme: dark)')
  })

  it('meets the contrast floor in both themes', () => {
    for (const theme of [light(), dark()]) {
      for (const [fg, bg] of TEXT_PAIRS) expect(contrast(theme[fg], theme[bg]), `${fg}/${bg}`).toBeGreaterThanOrEqual(4.5)
      for (const [fg, bg] of GRAPHIC_PAIRS) expect(contrast(theme[fg], theme[bg]), `${fg}/${bg}`).toBeGreaterThanOrEqual(3)
    }
  })
})
