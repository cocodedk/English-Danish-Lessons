import { render } from '@testing-library/react'
import type { Gable } from '../catalog'
import { House, gablePath, houseHeight } from './House'

function draw(gable: Gable, lit: number[] = []) {
  const { container } = render(<House color="gul" gable={gable} entryCount={8} lit={new Set(lit)} width={96} />)
  return container.querySelector('svg')!
}

describe('house', () => {
  it('draws the gable geometry for step, bell, point and cornice', () => {
    expect(houseHeight(8)).toBe(224)
    expect(gablePath('step', 224)).toBe(
      'M0 34 L19.2 34 L19.2 22.4 L38.4 22.4 L38.4 11.2 L57.6 11.2 L57.6 22.4 L76.8 22.4 L76.8 34 L96 34 L96 224 L0 224 Z',
    )
    expect(gablePath('point', 224)).toBe('M0 34 L48 0 L96 34 L96 224 L0 224 Z')
    expect(gablePath('cornice', 224)).toBe('M0 18.7 L96 18.7 L96 224 L0 224 Z')
    expect(gablePath('bell', 224)).toMatch(/^M0 40 Q[\d. ]+ 18\.7 Q[\d. ]+ 1\.7 48 0 Q[\dQ. ]+ L96 224 L0 224 Z$/)
    for (const gable of ['step', 'bell', 'point', 'cornice'] as const) {
      expect(draw(gable).querySelector('[data-part="facade"]')).toHaveAttribute('data-gable', gable)
    }
  })

  it('sizes the house from the entry count and fills the facade with the lesson colour', () => {
    const svg = draw('step')
    expect(svg).toHaveAttribute('viewBox', '0 0 96 224')
    expect(svg.querySelector('[data-part="facade"]')).toHaveAttribute('fill', 'var(--gul)')
    expect(houseHeight(6)).toBe(184)
  })

  it('places 8 windows in two columns of four, row by row', () => {
    const panes = [...draw('step').querySelectorAll('[data-part="pane"]')]
    expect(panes).toHaveLength(8)
    expect(panes.map((p) => [p.getAttribute('x'), p.getAttribute('y')])).toEqual([
      ['13', '47'], ['52.5', '47'],
      ['13', '87'], ['52.5', '87'],
      ['13', '127'], ['52.5', '127'],
      ['13', '167'], ['52.5', '167'],
    ])
  })

  it('fills lit windows with the lamp and a glow, and unlit ones dark', () => {
    const svg = draw('step', [0, 3])
    const fills = [...svg.querySelectorAll('[data-part="pane"]')].map((p) => p.getAttribute('fill'))
    expect(fills).toEqual([
      'var(--lamp)', 'var(--window-off)', 'var(--window-off)', 'var(--lamp)',
      'var(--window-off)', 'var(--window-off)', 'var(--window-off)', 'var(--window-off)',
    ])
    expect(svg.querySelectorAll('[data-part="glow"]')).toHaveLength(2)
    expect(draw('step').querySelectorAll('[data-part="glow"]')).toHaveLength(0)
  })
})
