import { getLesson, lessons } from '.'

const EXPECTED = [
  ['hej', 'Hej', 'Hello', 'hi', '[ˈhɑj]', 'Hello, or hi. Say it twice, hej hej, to mean bye.'],
  ['goddag', 'Goddag', 'Good day', 'go-DEH', '[ɡoˈdæˀ]', 'A polite hello, good for meeting someone new.'],
  ['tak', 'Tak', 'Thanks', 'tahg', '[ˈtɑɡ]', 'Thanks. You will say it all day.'],
  ['mange-tak', 'Mange tak', 'Thank you very much', 'MAHNG-uh tahg', '[ˈmɑŋə ˈtɑɡ]', 'Literally, many thanks.'],
  ['ja', 'Ja', 'Yes', 'yeh', '[ˈja]', 'Yes. Short and light.'],
  ['nej', 'Nej', 'No', 'nigh', '[ˈnɑjˀ]', 'No. The voice stops for a moment at the end. Danes call that catch stød.'],
  ['undskyld', 'Undskyld', 'Sorry', 'ON-skewl', '[ˈɔnˌsɡylˀ]', 'Sorry, or excuse me when you need to get past.'],
  ['farvel', 'Farvel', 'Goodbye', 'fah-VEL', '[fɑˈvɛl]', 'Goodbye. It sounds more final than hej hej.'],
]

const lesson = getLesson('hej-og-tak')!

describe('catalog', () => {
  it('has one lesson with the given title, colour and gable', () => {
    expect(lessons).toHaveLength(1)
    expect(lesson).toMatchObject({ title: 'Hej og tak', titleEn: 'Hello and thanks', color: 'gul', gable: 'step' })
    expect(getLesson('nope')).toBeUndefined()
  })

  it('has the eight entries in order, character for character', () => {
    const actual = lesson.entries.map((e) => [e.id, e.da, e.en, e.respelling, e.ipa, e.note])
    expect(actual).toEqual(EXPECTED)
  })

  it('has the praise word', () => {
    expect(lesson.praise).toEqual({ da: 'Velkommen', en: 'Welcome', respelling: 'VEL-kum-en', ipa: '[ˈvɛlˌkʌmˀən]' })
  })

  it('has unique ids and no empty field', () => {
    const ids = lesson.entries.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const entry of lesson.entries) {
      for (const value of Object.values(entry)) expect(value.trim()).not.toBe('')
    }
  })

  it('writes every IPA with the allowed symbols only', () => {
    const allowed = new Set(Array.from('ˈˌˀː[] hoɡdæɑjtmŋəaɔnsylfvɛkʌ'))
    for (const { ipa } of [...lesson.entries, lesson.praise]) {
      for (const char of Array.from(ipa)) expect(allowed.has(char), `${ipa}: ${char}`).toBe(true)
      expect(ipa).not.toMatch(/g/)
      expect(ipa).not.toMatch(/ε/)
    }
  })
})
