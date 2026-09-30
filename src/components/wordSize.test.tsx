import { screen } from '@testing-library/react'
import { renderAt, seedProgress, ENTRY_IDS, ENTRY_IDS_2 } from '../test/render'
import { readText } from '../test/files'
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
    expect(source).toMatch(/bottom: -30/)
    expect(source).not.toMatch(/\btop:/)
  })
})
