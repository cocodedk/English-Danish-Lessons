import { screen } from '@testing-library/react'

/** The innermost element whose whole text is `text`, even when part of it sits in a child (a `lang` span). */
export function byContent(text: string): HTMLElement {
  return screen.getByText((_, el) => {
    if (!el || el.textContent !== text) return false
    return !Array.from(el.children).some((child) => child.textContent === text)
  })
}
