import { screen } from '@testing-library/react'
import { renderAt, seedProgress, ENTRY_IDS, ENTRY_IDS_2 } from '../test/render'
import { readText } from '../test/files'
import { PLAY_OVERHANG } from './PlayButton'
import { wordSize } from './wordSize'

const TIERS = {
  1: ['clamp(72px, 22vw, 96px)', 0.95, 44],
  6: ['clamp(72px, 22vw, 96px)', 0.95, 44],
  7: ['clamp(52px, 15vw, 72px)', 1, 44],
  10: ['clamp(52px, 15vw, 72px)', 1, 44],
  11: ['clamp(36px, 10.5vw, 48px)', 1.05, 32],
  16: ['clamp(36px, 10.5vw, 48px)', 1.05, 32],
  17: ['clamp(28px, 8vw, 36px)', 1.1, 32],
  21: ['clamp(28px, 8vw, 36px)', 1.1, 32],
} as const

const style = (el: HTMLElement) => el.getAttribute('style') ?? ''

describe('word size', () => {
  it('returns the tiers for the boundary lengths', () => {
    for (const [n, [specimen, specimenLine, card]] of Object.entries(TIERS)) {
      expect(wordSize(Number(n)), n).toEqual({ specimen, specimenLine, card })
    }
  })

  it('counts a word by code point, spaces included', () => {
    expect(wordSize('Hyggeligt at møde dig')).toEqual(wordSize(21))
    expect(wordSize('Hej')).toEqual(wordSize(3))
    expect(wordSize('😀'.repeat(7))).toEqual(wordSize(7))
  })

  it('sizes the lesson page word from its length', () => {
    let view = renderAt('/lesson/hvem-er-du/8')
    expect(style(screen.getByRole('heading', { level: 1 }))).toContain('clamp(28px, 8vw, 36px)')
    view.unmount()
    view = renderAt('/lesson/hej-og-tak/1')
    expect(style(screen.getByRole('heading', { level: 1 }))).toContain('clamp(72px, 22vw, 96px)')
  })

  it('sizes the Home card word from its length', () => {
    seedProgress([], { 'hej-og-tak': ENTRY_IDS, 'hvem-er-du': ENTRY_IDS_2.slice(0, 7) })
    let view = renderAt('/')
    expect(style(screen.getByText('Hyggeligt at møde dig'))).toContain('32px')
    view.unmount()
    localStorage.clear()
    view = renderAt('/')
    expect(style(screen.getByText('Hej', { selector: 'p' }))).toContain('44px')
  })

  it('anchors the play button to the bottom of the Danish pane, not to a pixel offset from the top', async () => {
    const source = await readText('src/components/PlayButton.tsx')
    expect(source).toMatch(/position: 'absolute'/)
    expect(source).toMatch(/bottom: -HALF/)
    expect(source).not.toMatch(/\btop:/)
  })

  it('clears the play button: PLAY_OVERHANG is half its size plus 6, and only the Specimen pane pads by it', async () => {
    const button = await readText('src/components/PlayButton.tsx')
    expect(PLAY_OVERHANG).toBe(36)
    expect(button).toMatch(/const SIZE = 60\nconst HALF = SIZE \/ 2/)
    expect(button).toMatch(/export const PLAY_OVERHANG = HALF \+ 6/)
    expect(button).toMatch(/width: SIZE,\s+height: SIZE/)
    const specimen = await readText('src/components/Specimen.tsx')
    expect(specimen).toMatch(/clearButton: \(paddingBottom: number\) => \(\{ paddingBottom \}\)/)
    expect(specimen).toMatch(/styles\.clearButton\(PLAY_OVERHANG\)/)
    expect(specimen).not.toMatch(/paddingBottom: \d/)
    for (const file of ['components/SoundSection', 'pages/Sounds', 'pages/Home', 'pages/Done']) {
      expect(await readText(`src/${file}.tsx`), file).not.toMatch(/PLAY_OVERHANG/)
    }
  })
})
