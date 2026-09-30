import { act, fireEvent, screen, within } from '@testing-library/react'
import { sounds } from '../catalog/sounds'
import { readAll } from '../test/files'
import { renderAt } from '../test/render'
import { installSpeech, voice } from '../test/speech'

const NO_VOICE = 'This device has no Danish voice, so there is no sound here. The sound guides still work.'
const NO_SOUND = "This browser can't play sound. The sound guides still work."
const INTRO = 'Danish has sounds English lacks. Hear each one, then say it.'
const builtCss = (await readAll('dist/assets', '.css')).join('\n')
const hear = (da: string) => screen.getByRole('button', { name: `Hear ${da}` })
const stopButtons = () => screen.queryAllByRole('button', { name: 'Stop' })
const errorEvent = (error: string) => ({ error }) as unknown as SpeechSynthesisErrorEvent
const examples = sounds.flatMap((s) => s.examples)

describe('sounds page', () => {
  it('sets the title, shows the h1 and intro, and moves focus to the h1 on arrival', () => {
    installSpeech([voice('da-DK')])
    renderAt('/')
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Sounds' }))
    expect(document.title).toBe('Sounds · Hej.')
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Sounds')
    expect(h1).toHaveFocus()
    expect(screen.getByText(INTRO)).toBeInTheDocument()
    expect(screen.queryByRole('note')).toBeNull()
  })

  it('shows four sections, each with an h2, the tile mark, its paragraphs and three rows', () => {
    const { container } = renderAt('/sounds')
    const sections = Array.from(container.querySelectorAll('section'))
    expect(sections).toHaveLength(4)
    sounds.forEach((card, i) => {
      const section = within(sections[i])
      expect(section.getByRole('heading', { level: 2 })).toHaveTextContent(card.title)
      expect(section.getByText(card.mark)).toBeInTheDocument()
      for (const text of card.paragraphs) expect(section.getByText(text).tagName).toBe('P')
      expect(section.getAllByRole('listitem')).toHaveLength(3)
    })
  })

  it('shows each row with the Danish, both pronunciation helps, the English and the tip', () => {
    const { container } = renderAt('/sounds')
    for (const e of examples) {
      const row = within(hear(e.da).closest('li')!)
      expect(row.getByText(e.da)).toHaveAttribute('lang', 'da')
      expect(row.getByText(e.en)).toBeInTheDocument()
      expect(row.getByText(e.tip)).toBeInTheDocument()
      expect(row.getByText(e.respelling)).toBeInTheDocument()
      expect(row.getByText(e.ipa).closest('p')?.textContent).toBe(`Sounds like “${e.respelling}” · ${e.ipa}`)
    }
    const ipa = screen.getByText(examples[0].ipa)
    const family = Array.from(ipa.classList)
      .map((c) => builtCss.match(new RegExp(`\\.${c}[^{]*\\{\\s*font-family:\\s*([^;}]+)`))?.[1])
      .find(Boolean)
    const variable = family?.match(/^var\((--[\w-]+)\)$/)?.[1]
    expect(variable, 'the IPA element has a font-family from fonts.ipa').toBeDefined()
    expect(builtCss).toContain(`${variable}: "Noto Sans Variable", system-ui, sans-serif`)
    expect(screen.getAllByRole('button')).toHaveLength(12)
    expect(container.querySelectorAll('[lang="da"]').length).toBeGreaterThanOrEqual(12)
  })

  it('speaks the row with a local Danish voice at rate 0.85', () => {
    const synth = installSpeech([voice('en-US'), voice('da_DK')])
    renderAt('/sounds')
    expect(screen.queryByRole('note')).toBeNull()
    fireEvent.click(hear('Mad'))
    expect(synth.speak).toHaveBeenCalledTimes(1)
    expect(synth.spoken[0].text).toBe('Mad')
    expect(synth.spoken[0].voice?.lang).toBe('da_DK')
    expect(synth.spoken[0].rate).toBe(0.85)
    expect(stopButtons()).toHaveLength(1)
  })

  it('speaks nothing and shows the note for a remote Danish voice or only other languages', () => {
    for (const voices of [[voice('da-DK', false)], [voice('en-US'), voice('sv-SE')]]) {
      const synth = installSpeech(voices)
      const { unmount } = renderAt('/sounds')
      expect(screen.getByRole('note')).toHaveTextContent(NO_VOICE)
      for (const e of examples) expect(hear(e.da)).toHaveAttribute('aria-disabled', 'true')
      fireEvent.click(hear('Mad'))
      expect(synth.speak).not.toHaveBeenCalled()
      unmount()
    }
  })

  it('shows nothing on load when the voice list is empty, and waits on the tap only', async () => {
    vi.useFakeTimers()
    const synth = installSpeech([])
    renderAt('/sounds')
    expect(screen.queryByRole('note')).toBeNull()
    fireEvent.click(hear('Tre'))
    expect(stopButtons()[0]).toHaveAttribute('aria-busy', 'true')
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(hear('Tre')).not.toHaveAttribute('aria-busy')
    expect(screen.getByRole('note')).toHaveTextContent(NO_VOICE)
    expect(synth.speak).not.toHaveBeenCalled()
  })

  it('stops on a second press of the playing button', () => {
    const synth = installSpeech([voice('da-DK')])
    renderAt('/sounds')
    fireEvent.click(hear('Hund'))
    synth.cancel.mockClear()
    fireEvent.click(stopButtons()[0])
    expect(synth.cancel).toHaveBeenCalled()
    expect(stopButtons()).toHaveLength(0)
    expect(hear('Hund')).toBeInTheDocument()
    expect(synth.speak).toHaveBeenCalledTimes(1)
  })

  it('cancels the first word when another row starts', () => {
    const synth = installSpeech([voice('da-DK')])
    renderAt('/sounds')
    fireEvent.click(hear('Mad'))
    synth.cancel.mockClear()
    fireEvent.click(hear('Rød'))
    expect(synth.cancel).toHaveBeenCalled()
    expect(synth.spoken.map((u) => u.text)).toEqual(['Mad', 'Rød'])
    expect(stopButtons()).toHaveLength(1)
    expect(hear('Mad')).toBeInTheDocument()
  })

  it('says nothing on a cancel, and on any other error says the sound did not play', () => {
    const synth = installSpeech([voice('da-DK')])
    renderAt('/sounds')
    fireEvent.click(hear('Bro'))
    act(() => synth.spoken[0].onerror?.(errorEvent('canceled')))
    expect(screen.queryByRole('status')).toBeNull()
    fireEvent.click(hear('Bro'))
    act(() => synth.spoken[1].onerror?.(errorEvent('synthesis-failed')))
    expect(hear('Bro')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent("The sound didn't play. Try again.")
  })

  it('says the browser cannot play sound when there is no speech API', () => {
    renderAt('/sounds')
    expect(screen.getByRole('note')).toHaveTextContent(NO_SOUND)
    for (const e of examples) expect(hear(e.da)).toHaveAttribute('aria-disabled', 'true')
  })

  it('stores nothing and lights nothing', () => {
    installSpeech([voice('da-DK')])
    const { container } = renderAt('/sounds')
    fireEvent.click(hear('Mand'))
    expect(localStorage.length).toBe(0)
    expect(container.querySelector('svg[data-lit], g[data-lit]')).toBeNull()
  })
})
