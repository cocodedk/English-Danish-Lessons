import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { lessons, PLANNED_LESSONS, type Lesson } from '../catalog'
import { readText } from '../test/files'
import { houseHeight } from './House'
import { Skyline } from './Skyline'
import { GAP, MAX, MIN } from './streetItem'

function draw(street: readonly Lesson[]) {
  return render(
    <MemoryRouter>
      <Skyline lessons={street} progress={{ lit: {} }} />
    </MemoryRouter>,
  )
}

const plot = (container: HTMLElement) => container.querySelector<HTMLElement>('[data-plot]')
const copies = (n: number): Lesson[] => Array.from({ length: n }, (_, i) => ({ ...lessons[0], id: `copy-${i}` }))

describe('skyline', () => {
  it('shows the empty plot and Coming next while there are fewer lessons than planned', () => {
    const { container } = draw(lessons.slice(0, 2))
    expect(plot(container)).not.toBeNull()
    expect(screen.getByText('Coming next')).toBeInTheDocument()
    expect(screen.getByText('2 lessons')).toBeInTheDocument()
  })

  it('has no plot for the catalog, which reaches the planned five', () => {
    const { container } = draw(lessons)
    expect(lessons).toHaveLength(PLANNED_LESSONS)
    expect(plot(container)).toBeNull()
    expect(screen.queryByText('Coming next')).toBeNull()
    expect(screen.getByText('5 lessons')).toBeInTheDocument()
  })

  it('drops the plot and Coming next once every planned lesson has a house', () => {
    const { container } = draw(copies(PLANNED_LESSONS))
    expect(plot(container)).toBeNull()
    expect(screen.queryByText('Coming next')).toBeNull()
    expect(screen.getAllByRole('link')).toHaveLength(PLANNED_LESSONS)
  })

  it('has one item per lesson in each row, plus the plot, and tells CSS the count', () => {
    for (const [street, items] of [[lessons, 5], [lessons.slice(0, 3), 4]] as const) {
      const { container, unmount } = draw(street)
      const rows = container.querySelectorAll('ul')
      expect([...rows].map((r) => r.children.length)).toEqual([items, items])
      expect(container.querySelector<HTMLElement>('[data-street]')!.style.getPropertyValue('--lessons')).toBe(String(items))
      unmount()
    }
  })

  it('shares one width rule between both rows, clamped 48 to 96 px with 6 px gaps', async () => {
    expect([MIN, MAX, GAP]).toEqual([48, 96, 6])
    const source = await readText('src/components/Skyline.tsx')
    expect(source).toContain("import { streetItem } from './streetItem'")
    expect(source.match(/streetItem\.width/g)).toHaveLength(1)
    expect(source).not.toContain('clamp(')
    const rule = await readText('src/components/streetItem.ts')
    expect(rule).toContain('clamp(${MIN}px')
    expect(rule.match(/clamp\(/g)).toHaveLength(1)
  })

  it('puts each Danish title in its own item with its count, as one text node', () => {
    const { container } = draw(lessons)
    const titled = [...container.querySelectorAll('li')].filter((li) => li.querySelector('[lang="da"]'))
    expect(titled).toHaveLength(5)
    for (const li of titled) {
      expect(li.querySelector('[lang="da"]')!.nextElementSibling).toHaveTextContent(/^\d+ of \d+$/)
    }
    const long = screen.getByText('Mad og drikke')
    expect(long).toHaveAttribute('lang', 'da')
    expect(long.childNodes).toHaveLength(1)
  })

  it('gives the plot the last house\'s proportions, so it scales with the houses', () => {
    const short = { ...lessons[0], id: 'short', entries: lessons[0].entries.slice(0, 6) }
    const { container } = draw([lessons[0], short])
    expect(plot(container)!.style.aspectRatio.replace(/ /g, '')).toBe(`96/${houseHeight(6)}`)
    expect(plot(container)!.style.height).toBe('')
  })
})
