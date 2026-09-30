import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { getLesson } from '../catalog'
import { AppRoutes } from '../routes'
import { ENTRY_IDS, ENTRY_IDS_2, renderAt, seedProgress } from '../test/render'
import { byContent } from '../test/text'

const praise = getLesson('hej-og-tak')!.praise
const DONE = '/lesson/hej-og-tak/done'
const h1 = () => screen.getByRole('heading', { level: 1 })
const status = () => screen.getByRole('status')

describe('done', () => {
  it('celebrates when all eight windows are lit', () => {
    seedProgress(ENTRY_IDS)
    const { container } = renderAt(DONE)
    expect(status()).toHaveTextContent('All 8 windows lit. Velkommen!')
    expect(h1()).toHaveTextContent('Velkommen')
    expect(h1()).toHaveAttribute('lang', 'da')
    expect(container.textContent).toContain(`Sounds like “${praise.respelling}” · ${praise.ipa}`)
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(byContent('Hej og tak · all 8 windows lit').querySelector('[lang="da"]')).toHaveTextContent('Hej og tak')
    expect(container.querySelector('[data-bunting]')).not.toBeNull()
    expect(container.querySelectorAll('[data-flag]')).toHaveLength(11)
    expect(container.querySelectorAll('g[data-lit="true"]')).toHaveLength(8)
    expect(screen.getByRole('link', { name: 'Back to your street' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Practise again' })).toHaveAttribute('href', '/lesson/hej-og-tak/1')
  })

  it('is gentle when some windows are not lit', () => {
    seedProgress(['hej', 'goddag', 'tak'])
    const { container } = renderAt(DONE)
    expect(status()).toHaveTextContent('3 of 8 windows lit. 5 left to light.')
    expect(h1()).toHaveTextContent('3 of 8 windows lit')
    expect(screen.getByText('Go back to the entries you skipped to light the rest.')).toBeInTheDocument()
    expect(container.querySelector('[data-bunting]')).toBeNull()
    expect(container.querySelectorAll('g[data-lit="true"]')).toHaveLength(3)
    expect(screen.getByRole('link', { name: 'Light the rest' })).toHaveAttribute('href', '/lesson/hej-og-tak/4')
    expect(screen.getByRole('link', { name: 'Back to your street' })).toHaveAttribute('href', '/')
  })

  it('is gentle when nothing is lit', () => {
    const { container } = renderAt(DONE)
    expect(status()).toHaveTextContent('No windows lit yet.')
    expect(h1()).toHaveTextContent('0 of 8 windows lit')
    expect(byContent('Start with Hej and light your first window.')).toBeInTheDocument()
    expect(container.querySelector('[data-bunting]')).toBeNull()
    expect(screen.getByRole('link', { name: 'Start the lesson' })).toHaveAttribute('href', '/lesson/hej-og-tak/1')
  })

  it('announces the lesson on screen when the address changes from one done page to another', () => {
    seedProgress([], { 'hej-og-tak': ENTRY_IDS, 'hvem-er-du': ENTRY_IDS_2 })
    const Jump = () => {
      const go = useNavigate()
      return <button onClick={() => go('/lesson/hvem-er-du/done')}>jump</button>
    }
    render(
      <MemoryRouter initialEntries={[DONE]}>
        <AppRoutes />
        <Jump />
      </MemoryRouter>,
    )
    expect(status()).toHaveTextContent('All 8 windows lit. Velkommen!')
    fireEvent.click(screen.getByRole('button', { name: 'jump' }))
    expect(h1()).toHaveTextContent('Flot')
    expect(status()).toHaveTextContent('All 8 windows lit. Flot!')
  })

  it('says exactly how many are left when one remains', () => {
    seedProgress(ENTRY_IDS.slice(0, 7))
    renderAt(DONE)
    expect(status().textContent).toBe('7 of 8 windows lit. 1 left to light.')
    expect(screen.getByRole('link', { name: 'Light the rest' })).toHaveAttribute('href', '/lesson/hej-og-tak/8')
  })
})
