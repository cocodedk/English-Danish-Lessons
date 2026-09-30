import { getLesson, lessons, PLANNED_LESSONS } from '.'

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

const EXPECTED_2 = [
  ['jeg', 'Jeg', 'I', 'yai', '[ˈjɑj]', 'I. It is written with an e but said yai.'],
  ['du', 'Du', 'You', 'doo', '[ˈdu]', 'You, to one person. Say it like the English word do.'],
  ['hvad-hedder-du', 'Hvad hedder du?', 'What is your name?', 'va HEH-ther doo', '[va ˈheðɐ du]', 'Literally, what are you called. The h in hv is silent.'],
  ['jeg-hedder', 'Jeg hedder …', 'My name is …', 'yai HEH-ther', '[jɑj ˈheðɐ]', 'Say your own name after it. The dd is soft, like th in this.'],
  ['hvordan-har-du-det', 'Hvordan har du det?', 'How are you?', 'vor-DAN hah doo DEH', '[vɒˈdan hɑ du ˈde]', 'Literally, how have you it.'],
  ['godt', 'Godt', 'Good, fine', 'gut', '[ˈɡʌd]', 'Good, or fine: the usual answer to how are you.'],
  ['og-dig', 'Og dig?', 'And you?', 'ow dai', '[ɒw dɑj]', 'And you? Og means and.'],
  ['hyggeligt-at-moede', 'Hyggeligt at møde dig', 'Nice to meet you', 'HEW-guh-lid uh MUR-thuh dai', '[ˈhyɡəlid ʌ ˈmøːðə dɑj]', 'Nice to meet you. Hyggelig is the Danish word for cosy and friendly.'],
]

const [lesson, lesson2] = lessons
const table = (l: typeof lesson) => l.entries.map((e) => [e.id, e.da, e.en, e.respelling, e.ipa, e.note])

describe('catalog', () => {
  it('has the lessons in order with their titles, colours and gables', () => {
    expect(lessons.map((l) => l.id)).toEqual(['hej-og-tak', 'hvem-er-du'])
    expect(lesson).toMatchObject({ title: 'Hej og tak', titleEn: 'Hello and thanks', color: 'gul', gable: 'step' })
    expect(lesson2).toMatchObject({ title: 'Hvem er du?', titleEn: 'Who are you?', color: 'tegl', gable: 'point' })
    expect(getLesson('hvem-er-du')).toBe(lesson2)
    expect(getLesson('nope')).toBeUndefined()
    expect(PLANNED_LESSONS).toBe(5)
  })

  it('has every lesson colour and gable valid', () => {
    for (const l of lessons) {
      expect(['gul', 'tegl', 'hav', 'salvie', 'rosa']).toContain(l.color)
      expect(['step', 'bell', 'point', 'cornice']).toContain(l.gable)
    }
  })

  it('has the eight entries of lesson 1 in order, character for character', () => {
    expect(table(lesson)).toEqual(EXPECTED)
  })

  it('has the eight entries of lesson 2 in order, character for character', () => {
    expect(table(lesson2)).toEqual(EXPECTED_2)
  })

  it('has the praise words', () => {
    expect(lesson.praise).toEqual({ da: 'Velkommen', en: 'Welcome', respelling: 'VEL-kum-en', ipa: '[ˈvɛlˌkʌmˀən]' })
    expect(lesson2.praise).toEqual({ da: 'Flot', en: 'Well done', respelling: 'flut', ipa: '[ˈflʌd]' })
  })

  it('has entry ids unique across all lessons and no empty field', () => {
    const ids = lessons.flatMap((l) => l.entries.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const entry of lessons.flatMap((l) => l.entries)) {
      for (const value of Object.values(entry)) expect(value.trim()).not.toBe('')
    }
  })

  it('writes every IPA with the allowed symbols only', () => {
    const allowed = new Set(
      Array.from('[]ˈˌˀː abdefhijklmnostuvwyæðøŋœɐɑɒɔɕəɛɡɶʁʌ̯'),
    )
    for (const { ipa } of lessons.flatMap((l) => [...l.entries, l.praise])) {
      for (const char of Array.from(ipa)) expect(allowed.has(char), `${ipa}: ${char}`).toBe(true)
      expect(ipa).not.toMatch(/g/)
      expect(ipa).not.toMatch(/ε/)
    }
  })
})
