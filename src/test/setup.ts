import '@testing-library/jest-dom/vitest'
import { resetStorage } from '../storage/core'
import { removeRecorder } from './recorder'

// jsdom has no speech, no layout and no modal dialogs: the stubs below are what the tests use.
class FakeUtterance {
  text: string
  voice: SpeechSynthesisVoice | null = null
  lang = ''
  rate = 1
  onend: (() => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null
  constructor(text = '') {
    this.text = text
  }
}
Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true, writable: true })

const dialog = HTMLDialogElement.prototype
if (typeof dialog.showModal !== 'function') {
  dialog.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
}
if (typeof dialog.close !== 'function') {
  dialog.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

// jsdom plays no media: these keep an unmount after the test's own spies are restored quiet.
HTMLMediaElement.prototype.play = () => Promise.resolve()
HTMLMediaElement.prototype.pause = () => undefined

beforeEach(() => {
  localStorage.clear()
  resetStorage()
  document.documentElement.removeAttribute('data-theme')
  document.title = ''
})

afterEach(() => {
  removeRecorder()
  Reflect.deleteProperty(window, 'speechSynthesis')
  Reflect.deleteProperty(document, 'modelContext')
  vi.useRealTimers()
  vi.restoreAllMocks()
})
