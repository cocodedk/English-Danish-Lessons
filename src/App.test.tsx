import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders Home at the root of the hash router', () => {
    window.location.hash = ''
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hej.')
  })

  it('styles its components through StyleX', () => {
    window.location.hash = ''
    render(<App />)
    expect(screen.getByRole('main').className).toMatch(/\bx[a-z0-9]+\b/)
    expect(screen.getByRole('heading', { level: 1 }).className).toMatch(/\bx[a-z0-9]+\b/)
  })
})
