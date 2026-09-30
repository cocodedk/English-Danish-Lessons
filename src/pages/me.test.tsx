import { act, fireEvent, screen, within } from '@testing-library/react'
import { resetStorage } from '../storage/core'
import { renderAt, seedName, seedProgress } from '../test/render'

const nameCard = () => within(screen.getByRole('region', { name: 'Your name' }))
const progressCard = () => within(screen.getByRole('region', { name: 'Your progress' }))
const input = () => screen.getByLabelText('Name')
const save = () => screen.getByRole('button', { name: 'Save name' })
const type = (value: string) => fireEvent.change(input(), { target: { value } })
const savedName = () => JSON.parse(localStorage.getItem('edl.v1.profile') ?? 'null')?.value?.name
const lit = () => JSON.parse(localStorage.getItem('edl.v1.progress') ?? 'null')?.value?.lit
const opener = () => screen.getAllByRole('button', { name: 'Delete progress' })[0]
const dialog = () => document.querySelector('dialog')!

describe('me', () => {
  it('saves a trimmed name and offers to remove it', () => {
    renderAt('/me')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Me')
    expect(screen.queryByRole('button', { name: 'Remove name' })).toBeNull()
    expect(save()).toBeDisabled()
    type('  Sam  ')
    expect(save()).toBeEnabled()
    fireEvent.click(save())
    expect(savedName()).toBe('Sam')
    expect(nameCard().getByRole('status')).toHaveTextContent('Name saved.')
    expect(screen.getByRole('button', { name: 'Remove name' })).toBeInTheDocument()
    expect(save()).toBeDisabled()
  })

  it('removes the name', () => {
    seedName('Sam')
    renderAt('/me')
    expect(input()).toHaveValue('Sam')
    fireEvent.click(screen.getByRole('button', { name: 'Remove name' }))
    expect(savedName()).toBeUndefined()
    expect(localStorage.getItem('edl.v1.profile')).toBeNull()
    expect(input()).toHaveValue('')
    expect(nameCard().getByRole('status')).toHaveTextContent('Name removed.')
    expect(screen.queryByRole('button', { name: 'Remove name' })).toBeNull()
  })

  it('refuses an over-long name, a name with a control character and an unchanged name', () => {
    seedName('Sam')
    renderAt('/me')
    expect(save()).toBeDisabled()
    type('a'.repeat(25))
    expect(screen.getByText('Use 24 characters or fewer.')).toBeInTheDocument()
    expect(save()).toBeDisabled()
    type('Sa\u0007m')
    expect(screen.getByText("That name has a character we can't save. Remove it and try again.")).toBeInTheDocument()
    expect(save()).toBeDisabled()
    type('a'.repeat(24))
    expect(screen.queryByText('Use 24 characters or fewer.')).toBeNull()
    expect(save()).toBeEnabled()
    type('   ')
    expect(save()).toBeDisabled()
  })

  it('says "for now" and shows the storage note when storage is not saving', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    resetStorage()
    renderAt('/me')
    expect(screen.getAllByRole('status')[0]).toHaveTextContent("This browser can't save your progress, name or colour choice.")
    type('Sam')
    fireEvent.click(save())
    expect(nameCard().getByRole('status')).toHaveTextContent('Name saved for now.')
    fireEvent.click(screen.getByRole('button', { name: 'Remove name' }))
    expect(nameCard().getByRole('status')).toHaveTextContent('Name removed for now.')
  })

  it('changes the colour mode at once and stores it', () => {
    renderAt('/me')
    expect(screen.getByRole('group', { name: 'Colour mode' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Auto' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(JSON.parse(localStorage.getItem('edl.v1.prefs')!).value).toEqual({ colorMode: 'dark' })
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    fireEvent.click(screen.getByRole('radio', { name: 'Auto' }))
    expect(document.documentElement).not.toHaveAttribute('data-theme')
    expect(JSON.parse(localStorage.getItem('edl.v1.prefs')!).value).toEqual({ colorMode: 'auto' })
  })

  it('applies a colour mode chosen in another tab on every page', () => {
    for (const path of ['/', '/me', '/lesson/hej-og-tak/1', '/lesson/hej-og-tak/done', '/nowhere']) {
      const { unmount } = renderAt(path)
      for (const mode of ['dark', 'light']) {
        act(() => {
          localStorage.setItem('edl.v1.prefs', JSON.stringify({ schemaVersion: 1, value: { colorMode: mode } }))
          window.dispatchEvent(new StorageEvent('storage', { key: 'edl.v1.prefs' }))
        })
        expect(document.documentElement, path).toHaveAttribute('data-theme', mode)
      }
      unmount()
    }
  })

  it('has no delete button with nothing lit, and states the privacy promise', () => {
    renderAt('/me')
    expect(progressCard().getByText('No windows lit yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete progress' })).toBeNull()
    expect(
      screen.getByText(
        'Hej saves your name, your progress and your colour choice in this browser only. Nothing is sent anywhere, and there are no accounts.',
      ),
    ).toBeInTheDocument()
  })

  it('opens the dialog with Keep it focused, and Keep it and Escape change nothing', () => {
    seedProgress(['hej', 'goddag', 'tak'])
    renderAt('/me')
    expect(progressCard().getByText('3 of 16 windows lit.')).toBeInTheDocument()
    expect(dialog()).not.toHaveAttribute('open')
    fireEvent.click(opener())
    expect(dialog()).toHaveAttribute('open')
    expect(within(dialog()).getByText('Delete your progress?')).toBeInTheDocument()
    expect(within(dialog()).getByText("Every lit window on your street goes dark. You can't undo this.")).toBeInTheDocument()
    expect(within(dialog()).getByRole('button', { name: 'Keep it' })).toHaveFocus()
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Keep it' }))
    expect(dialog()).not.toHaveAttribute('open')
    expect(opener()).toHaveFocus()
    fireEvent.click(opener())
    expect(dialog()).toHaveAttribute('open')
    fireEvent(dialog(), new Event('cancel', { cancelable: true }))
    expect(dialog()).not.toHaveAttribute('open')
    expect(opener()).toHaveFocus()
    expect(lit()['hej-og-tak']).toEqual(['hej', 'goddag', 'tak'])
  })

  it('deletes the progress on confirm and moves focus to the section heading', () => {
    seedProgress(['hej', 'goddag', 'tak'])
    renderAt('/me')
    fireEvent.click(opener())
    fireEvent.click(within(dialog()).getByRole('button', { name: 'Delete progress' }))
    expect(lit()).toEqual({})
    expect(progressCard().getByText('No windows lit yet.')).toBeInTheDocument()
    expect(progressCard().getByRole('status')).toHaveTextContent('Progress deleted.')
    expect(screen.queryByRole('button', { name: 'Delete progress' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Your progress' })).toHaveFocus()
  })
})
