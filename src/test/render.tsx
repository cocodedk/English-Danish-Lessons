import { render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from '../routes'

export const LESSON = 'hej-og-tak'
export const ENTRY_IDS = ['hej', 'goddag', 'tak', 'mange-tak', 'ja', 'nej', 'undskyld', 'farvel']

export const LESSON_2 = 'hvem-er-du'
export const ENTRY_IDS_2 = [
  'jeg', 'du', 'hvad-hedder-du', 'jeg-hedder', 'hvordan-har-du-det', 'godt', 'og-dig', 'hyggeligt-at-moede',
]

export const ENTRY_IDS_3 = ['en', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'otte', 'ni', 'ti']
export const ENTRY_IDS_4 = ['vand', 'kaffe', 'te', 'maelk', 'oel', 'broed', 'smoer', 'ost', 'aeble', 'suppe']
export const ENTRY_IDS_5 = ['by', 'gade', 'bus', 'tog', 'station', 'butik', 'hus', 'cykel', 'bro', 'torv']

/** Every entry of every lesson lit. */
export const ALL_LIT: Record<string, string[]> = {
  [LESSON]: ENTRY_IDS,
  [LESSON_2]: ENTRY_IDS_2,
  tal: ENTRY_IDS_3,
  'mad-og-drikke': ENTRY_IDS_4,
  byen: ENTRY_IDS_5,
}

/** Lights `ids` in lesson 1, or `lit` (lesson id to entry ids) across lessons. */
export function seedProgress(ids: string[], lit: Record<string, string[]> = { [LESSON]: ids }) {
  localStorage.setItem('edl.v1.progress', JSON.stringify({ schemaVersion: 1, value: { lit } }))
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
