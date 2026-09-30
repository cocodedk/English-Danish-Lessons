import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the Hej heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Hej.' })).toBeInTheDocument()
  })

  it('styles the page through StyleX', () => {
    render(<App />)
    expect(screen.getByRole('main').className).toMatch(/\bx[a-z0-9]+\b/)
  })
})
