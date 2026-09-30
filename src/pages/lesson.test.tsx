import { fireEvent, screen } from '@testing-library/react'
import { getLesson } from '../catalog'
import { ENTRY_IDS, renderAt, seedProgress } from '../test/render'
import { byContent } from '../test/text'

const entries = getLesson('hej-og-tak')!.entries
const where = () => screen.getByTestId('where').textContent
const stored = () => JSON.parse(localStorage.getItem('edl.v1.progress') ?? 'null')?.value?.lit?.['hej-og-tak']
const said = () => screen.getByRole('button', { name: /^(I said it|Said it ✓)$/ })
const announcer = () => screen.getAllByRole('status')[0]

describe('lesson entry', () => {
  it('shows every field of the entry, with the Danish marked as Danish', () => {
    const { container } = renderAt('/lesson/hej-og-tak/4')
    const e = entries[3]
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Mange tak')
    expect(h1).toHaveAttribute('lang', 'da')
    expect(container.textContent).toContain(`Sounds like “${e.respelling}” · ${e.ipa}`)
    expect(container.textContent).toContain(e.ipa)
    expect(screen.getByText(e.en)).toBeInTheDocument()
    expect(screen.getByText(e.note)).toBeInTheDocument()
    expect(byContent('Hej og tak · 4 of 8').querySelector('[lang="da"]')).toHaveTextContent('Hej og tak')
    expect(screen.getByRole('link', { name: 'Back to your street' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: 'Hear Mange tak' })).toBeInTheDocument()
    expect(screen.getByText('Not lit yet')).toBeInTheDocument()
    expect(screen.getByText('Say it out loud, then tap “I said it”.')).toBeInTheDocument()
  })

  it('lights the window on "I said it", saves it, announces it, and does nothing the second time', () => {
    renderAt('/lesson/hej-og-tak/1')
    expect(said()).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(said())
    expect(said()).toHaveTextContent('Said it ✓')
    expect(said()).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Lit')).toBeInTheDocument()
    expect(stored()).toEqual(['hej'])
    expect(announcer()).toHaveTextContent('Window lit. 1 of 8 lit.')
    fireEvent.click(said())
    expect(stored()).toEqual(['hej'])
    expect(announcer()).toHaveTextContent('Window lit. 1 of 8 lit.')
  })

  it('disables Back on the first entry and links Back and Next elsewhere', () => {
    const { unmount } = renderAt('/lesson/hej-og-tak/1')
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Next: Goddag' })).toHaveAttribute('href', '/lesson/hej-og-tak/2')
    unmount()
    renderAt('/lesson/hej-og-tak/3')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/lesson/hej-og-tak/2')
    expect(screen.getByRole('link', { name: 'Next: Mange tak' })).toHaveAttribute('href', '/lesson/hej-og-tak/4')
  })

  it('offers Finish on the last entry', () => {
    renderAt('/lesson/hej-og-tak/8')
    expect(screen.getByRole('link', { name: 'Finish' })).toHaveAttribute('href', '/lesson/hej-og-tak/done')
    expect(screen.queryByRole('link', { name: /^Next/ })).toBeNull()
  })

  it('lets the learner skip an entry without lighting it', () => {
    renderAt('/lesson/hej-og-tak/1')
    fireEvent.click(screen.getByRole('link', { name: 'Next: Goddag' }))
    expect(where()).toBe('/lesson/hej-og-tak/2')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Goddag')
    expect(stored()).toBeUndefined()
  })

  it('renders Not found for a bad position or an unknown lesson', () => {
    for (const path of [
      '/lesson/hej-og-tak/0',
      '/lesson/hej-og-tak/9',
      '/lesson/hej-og-tak/abc',
      '/lesson/hej-og-tak/1.5',
      '/lesson/nope/1',
      '/lesson/nope',
      '/lesson/nope/done',
    ]) {
      const { unmount } = renderAt(path)
      expect(screen.getByRole('heading', { level: 1 }), path).toHaveTextContent("That page doesn't exist.")
      unmount()
    }
  })

  it('sends the bare lesson URL to the first unlit entry', () => {
    const cases: [string[], string][] = [
      [[], '/lesson/hej-og-tak/1'],
      [['hej', 'goddag'], '/lesson/hej-og-tak/3'],
      [ENTRY_IDS, '/lesson/hej-og-tak/1'],
    ]
    for (const [ids, expected] of cases) {
      seedProgress(ids)
      const { unmount } = renderAt('/lesson/hej-og-tak')
      expect(where()).toBe(expected)
      unmount()
    }
  })
})
