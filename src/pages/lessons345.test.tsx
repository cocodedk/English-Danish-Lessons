import { render, screen } from '@testing-library/react'
import { getLesson, lessons } from '../catalog'
import { House, houseHeight } from '../components/House'
import { ALL_LIT, ENTRY_IDS, ENTRY_IDS_2, ENTRY_IDS_3, LESSON, LESSON_2, renderAt, seedProgress } from '../test/render'
import { byContent } from '../test/text'

const NEW = ['tal', 'mad-og-drikke', 'byen']
const DONE_LINE: Record<string, string> = { tal: 'Super', 'mad-og-drikke': 'Velbekomme', byen: 'Hyggeligt' }
const h1 = () => screen.getByRole('heading', { level: 1 })
const card = () => screen.getByRole('region', { name: 'Continue' })

describe('lessons 3 to 5', () => {
  it('draws five house links with no plot, from storage per lesson', () => {
    seedProgress([], { ...ALL_LIT, tal: ENTRY_IDS_3.slice(0, 4), byen: [] })
    const { container } = renderAt('/')
    const names = ['Hej og tak, 8 of 8', 'Hvem er du?, 8 of 8', 'Tal, 4 of 10', 'Mad og drikke, 10 of 10', 'Byen, 0 of 10']
    for (const name of names) expect(screen.getByRole('link', { name: `${name} windows lit` })).toBeInTheDocument()
    const tal = screen.getByRole('link', { name: 'Tal, 4 of 10 windows lit' })
    expect(tal).toHaveAttribute('href', '/lesson/tal')
    expect(tal.querySelectorAll('g[data-lit="true"]')).toHaveLength(4)
    expect(tal.querySelectorAll('g[data-lit="false"]')).toHaveLength(6)
    expect(container.querySelectorAll('[data-house]')).toHaveLength(5)
    expect(container.querySelector('[data-plot]')).toBeNull()
    expect(screen.queryByText('Coming next')).toBeNull()
    expect(screen.getByText('5 lessons')).toBeInTheDocument()
  })

  it('continues with Tal once lessons 1 and 2 are complete', () => {
    seedProgress([], { [LESSON]: ENTRY_IDS, [LESSON_2]: ENTRY_IDS_2 })
    renderAt('/')
    expect(byContent('Start Tal')).toBeInTheDocument()
    expect(card()).toHaveTextContent('En')
    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/lesson/tal/1')
    expect(byContent('16 windows lit on your street.')).toBeInTheDocument()
  })

  it('makes a ten-entry house five rows of two windows, 264 high', () => {
    const { container } = render(<House color="hav" gable="bell" entryCount={10} lit={new Set([9])} width={96} />)
    const panes = [...container.querySelectorAll('[data-part="pane"]')]
    expect(houseHeight(10)).toBe(264)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 96 264')
    expect(panes).toHaveLength(10)
    expect(new Set(panes.map((p) => p.getAttribute('y'))).size).toBe(5)
    expect(new Set(panes.map((p) => p.getAttribute('x'))).size).toBe(2)
    expect(panes[9]).toHaveAttribute('fill', 'var(--lamp)')
  })

  it('shows an entry page, the done page and the bare-URL redirect for each new lesson', () => {
    for (const id of NEW) {
      const lesson = getLesson(id)!
      const last = lesson.entries[9]
      let view = renderAt(`/lesson/${id}/10`)
      expect(h1()).toHaveTextContent(last.da)
      expect(view.container.textContent).toContain(`Sounds like “${last.respelling}” · ${last.ipa}`)
      expect(byContent(`${lesson.title} · 10 of 10`)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Finish' })).toHaveAttribute('href', `/lesson/${id}/done`)
      view.unmount()

      seedProgress([], { [id]: lesson.entries.map((e) => e.id) })
      view = renderAt(`/lesson/${id}/done`)
      expect(screen.getByRole('status')).toHaveTextContent(`All 10 windows lit. ${DONE_LINE[id]}!`)
      expect(h1()).toHaveTextContent(lesson.praise.da)
      expect(view.container.textContent).toContain(`Sounds like “${lesson.praise.respelling}” · ${lesson.praise.ipa}`)
      expect(byContent(`${lesson.title} · all 10 windows lit`).querySelector('[lang="da"]')).toHaveTextContent(lesson.title)
      view.unmount()

      seedProgress([], { [id]: lesson.entries.slice(0, 3).map((e) => e.id) })
      view = renderAt(`/lesson/${id}`)
      expect(screen.getByTestId('where')).toHaveTextContent(`/lesson/${id}/4`)
      view.unmount()
    }
  })

  it('renders the combining mark in the IPA of Smør, unchanged', () => {
    const smoer = lessons[3].entries.find((e) => e.id === 'smoer')!
    expect(smoer.ipa).toContain('̯')
    expect(smoer.ipa).toBe('[ˈsmɶɐ̯]')
    renderAt('/lesson/mad-og-drikke/7')
    expect(screen.getByText(smoer.ipa).textContent).toBe('[ˈsmɶɐ̯]')
    expect(screen.getByText(smoer.ipa).textContent).toContain('̯')
  })
})
