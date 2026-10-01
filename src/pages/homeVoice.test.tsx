import { act, fireEvent, screen, within } from '@testing-library/react'
import { resetStorage } from '../storage/core'
import { renderAt } from '../test/render'
import { installSpeech, voice } from '../test/speech'

const STORAGE_NOTE =
  "This browser can't save your progress, name or colour choice. They will be lost when you reload or close the page."
const LESSON_NO_VOICE = 'This device has no Danish voice, so there is no sound. Use the sound guide above.'
const SOUNDS_NO_VOICE = 'This device has no Danish voice, so there is no sound here. The sound guides still work.'
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms) })

const ANDROID = [
  'Open Settings and search for “text-to-speech” (usually under General management, or under System, Languages and input).',
  'Choose Google Text-to-speech as the preferred engine, then open its settings with the gear.',
  'Tap Install voice data, choose Danish (Denmark) and download it.',
  'Come back to this page and reload it.',
]
const IPHONE = [
  'Open Settings, then Accessibility, then Read and Speak (older versions call it Spoken Content).',
  'Tap Voices, then Danish.',
  'Choose a voice and tap the download button next to it. Wait until it has finished.',
  'Come back to this page and reload it.',
]

describe('the Home voice notice', () => {
  it('shows nothing while checking and when a Danish voice is available', async () => {
    vi.useFakeTimers()
    installSpeech([])
    const checking = renderAt('/')
    expect(screen.queryByRole('note')).toBeNull()
    checking.unmount()
    installSpeech([voice('da-DK')])
    renderAt('/')
    await advance(3000)
    expect(screen.queryByRole('note')).toBeNull()
  })

  it('says there is no Danish sound and how to add a voice, with the details closed', () => {
    installSpeech([voice('en-US')])
    renderAt('/')
    const note = screen.getByRole('note')
    const paragraphs = Array.from(note.children).filter((el) => el.tagName === 'P')
    expect(paragraphs.map((p) => p.textContent)).toEqual([
      'No Danish sound on this device.',
      'Hej. plays Danish with a Danish voice your device already has, and this one has none. The sound guides under each word still work.',
    ])
    const details = note.querySelector('details')!
    expect(details).not.toHaveAttribute('open')
    expect(details.querySelector('summary')).toHaveTextContent(/^How to add a Danish voice$/)
    const body = Array.from(details.children).slice(1)
    expect(body.map((el) => [el.tagName, el.textContent])).toEqual([
      ['P', 'Pick your device. Menu names vary a little by maker and version.'],
      ['P', 'Android'],
      ['OL', ANDROID.join('')],
      ['P', 'iPhone'],
      ['OL', IPHONE.join('')],
      ['P', 'Voices that need the internet are not used, because that would send the words to a speech service.'],
    ])
    expect(body[1].firstElementChild?.tagName).toBe('STRONG')
    expect(body[3].firstElementChild?.tagName).toBe('STRONG')
    for (const [list, steps] of [[body[2], ANDROID], [body[4], IPHONE]] as const) {
      expect(within(list as HTMLElement).getAllByRole('listitem').map((li) => li.textContent)).toEqual(steps)
    }
    fireEvent.click(details.querySelector('summary')!)
    expect(details).toHaveAttribute('open')
  })

  it('says the browser cannot play sound, without details', () => {
    renderAt('/')
    const note = screen.getByRole('note')
    expect(Array.from(note.querySelectorAll('p')).map((p) => p.textContent)).toEqual([
      'No Danish sound in this browser.',
      'Hej. cannot play sound here. The sound guides under each word still work. Another browser may play it.',
    ])
    expect(note.querySelector('details')).toBeNull()
  })

  it('sits before the storage note and the street, cannot be dismissed, and goes when a voice turns up', () => {
    const synth = installSpeech([voice('en-US')])
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    resetStorage()
    renderAt('/')
    const note = screen.getByRole('note')
    const storage = screen.getByText(STORAGE_NOTE)
    const street = screen.getByRole('link', { name: /^Hej og tak, / })
    const before = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(before(screen.getByText(/^Your street is waiting/), note)).toBe(true)
    expect(before(note, storage)).toBe(true)
    expect(before(note, street)).toBe(true)
    expect(note).toHaveAttribute('role', 'note')
    expect(within(note).queryByRole('button')).toBeNull()
    act(() => synth.setVoices([voice('en-US'), voice('da-DK')]))
    expect(screen.queryByRole('note')).toBeNull()
    expect(screen.getByText(STORAGE_NOTE)).toBeInTheDocument()
  })

  it('adds the note to the lesson entry and Sounds after 2 s, and removes it when a voice arrives', async () => {
    for (const [path, text] of [['/lesson/hej-og-tak/1', LESSON_NO_VOICE], ['/sounds', SOUNDS_NO_VOICE]]) {
      vi.useFakeTimers()
      const synth = installSpeech([])
      const { unmount } = renderAt(path)
      expect(screen.queryByRole('note'), path).toBeNull()
      await advance(1999)
      expect(screen.queryByRole('note'), path).toBeNull()
      await advance(1)
      expect(screen.getByRole('note'), path).toHaveTextContent(text)
      act(() => synth.setVoices([voice('da-DK')]))
      expect(screen.queryByRole('note'), path).toBeNull()
      unmount()
    }
  })
})
