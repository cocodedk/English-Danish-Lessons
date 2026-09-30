import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { lessons, PLANNED_LESSONS, type Lesson } from '../catalog'
import { houseHeight } from './House'
import { Skyline } from './Skyline'

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

  it('makes the plot as tall as the last house', () => {
    const short = { ...lessons[0], id: 'short', entries: lessons[0].entries.slice(0, 6) }
    const { container } = draw([lessons[0], short])
    expect(plot(container)!.style.height).toBe(`${houseHeight(6)}px`)
  })
})
