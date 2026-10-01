import { screen, within } from '@testing-library/react'
import { renderAt, seedName } from '../test/render'

const wordmark = () => screen.queryByRole('link', { name: 'Hej.' })
const reads = (container: HTMLElement, text: string) =>
  [...container.querySelectorAll('*')].filter((e) => e.textContent === text)

describe('home top bar', () => {
  it('says Hej once: the greeting is the brand, with a name or without', () => {
    const { container, unmount } = renderAt('/')
    expect(reads(container, 'Hej.')).toEqual([screen.getByRole('heading', { level: 1 })])
    expect(wordmark()).toBeNull()
    unmount()
    seedName('Sam')
    const named = renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hej, Sam.')
    expect(reads(named.container, 'Hej.')).toEqual([])
    expect(wordmark()).toBeNull()
  })

  it('keeps the wordmark on Sounds, Me, About, Not found and the done page', () => {
    for (const path of ['/sounds', '/me', '/about', '/nowhere', '/lesson/hej-og-tak/done']) {
      const { unmount } = renderAt(path)
      expect(wordmark(), path).toHaveAttribute('href', '/')
      unmount()
    }
  })

  it('keeps the back chip and position label on the lesson entry, and gives it no wordmark', () => {
    renderAt('/lesson/hej-og-tak/4')
    expect(wordmark()).toBeNull()
    expect(screen.getByRole('link', { name: 'Back to your street' })).toHaveAttribute('href', '/')
    expect(screen.getByText(/· 4 of 8$/)).toBeInTheDocument()
  })

  it('renders no header on Home, and the main nav stays', () => {
    const { container, unmount } = renderAt('/')
    expect(container.querySelector('header')).toBeNull()
    expect(screen.queryByRole('banner')).toBeNull()
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link')).toHaveLength(3)
    unmount()
    expect(renderAt('/sounds').container.querySelector('header')).not.toBeNull()
  })
})
