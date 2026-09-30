import { render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from '../routes'

export const LESSON = 'hej-og-tak'
export const ENTRY_IDS = ['hej', 'goddag', 'tak', 'mange-tak', 'ja', 'nej', 'undskyld', 'farvel']

export function seedProgress(ids: string[]) {
  localStorage.setItem('edl.v1.progress', JSON.stringify({ schemaVersion: 1, value: { lit: { [LESSON]: ids } } }))
}

export function seedName(name: string) {
  localStorage.setItem('edl.v1.profile', JSON.stringify({ schemaVersion: 1, value: { name } }))
}

function Where() {
  return <span data-testid="where">{useLocation().pathname}</span>
}

/** Renders every route inside a MemoryRouter at `path`, with the current path readable as `where`. */
export function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <Where />
    </MemoryRouter>,
  )
}
