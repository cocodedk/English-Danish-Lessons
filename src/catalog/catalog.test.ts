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

const EXPECTED_3 = [
  ['en', 'En', 'One', 'ehn', '[ˈeˀn]', 'One. Before a noun Danes use en or et, depending on the noun.'],
  ['to', 'To', 'Two', 'toe', '[ˈtoˀ]', 'Two. The voice catches at the end.'],
  ['tre', 'Tre', 'Three', 'treh', '[ˈtʁɛˀ]', 'Three. The Danish r is made at the back of the throat.'],
  ['fire', 'Fire', 'Four', 'FEE-uh', '[ˈfiːʌ]', 'Four. Two syllables.'],
  ['fem', 'Fem', 'Five', 'fem', '[ˈfɛmˀ]', 'Five. The m has a small catch at the end.'],
  ['seks', 'Seks', 'Six', 'sehgs', '[ˈsɛɡs]', 'Six. The k sounds like a g.'],
  ['syv', 'Syv', 'Seven', 'sue', '[ˈsywˀ]', 'Seven. Say ee with your lips rounded, as if for oo.'],
  ['otte', 'Otte', 'Eight', 'OH-duh', '[ˈɔːdə]', 'Eight. The tt sounds like a d.'],
  ['ni', 'Ni', 'Nine', 'nee', '[ˈniˀ]', 'Nine. Like the English word knee.'],
  ['ti', 'Ti', 'Ten', 'tee', '[ˈtiˀ]', 'Ten. Like the English word tea, with a catch at the end.'],
]

const EXPECTED_4 = [
  ['vand', 'Vand', 'Water', 'van', '[ˈvanˀ]', 'Water. The first word to know in a café.'],
  ['kaffe', 'Kaffe', 'Coffee', 'KAH-fuh', '[ˈkɑfə]', 'Coffee. Stress the first syllable.'],
  ['te', 'Te', 'Tea', 'teh', '[ˈteˀ]', 'Tea. Short, with a small catch at the end.'],
  ['maelk', 'Mælk', 'Milk', 'melg', '[ˈmɛlˀɡ]', 'Milk. The k at the end sounds like a g.'],
  ['oel', 'Øl', 'Beer', 'url', '[ˈøl]', 'Beer. Say ur without the r.'],
  ['broed', 'Brød', 'Bread', 'brurth', '[ˈbʁœðˀ]', 'Bread. The d is soft, like th in this.'],
  ['smoer', 'Smør', 'Butter', 'smur', '[ˈsmɶɐ̯]', 'Butter. The ø glides into a soft r.'],
  ['ost', 'Ost', 'Cheese', 'awst', '[ˈɔsd]', 'Cheese. The last t sounds like a d.'],
  ['aeble', 'Æble', 'Apple', 'EH-bluh', '[ˈɛːblə]', 'Apple. The æ is like the e in bet, held a little longer.'],
  ['suppe', 'Suppe', 'Soup', 'SAW-buh', '[ˈsɔbə]', 'Soup. The pp sounds like a b.'],
]

const EXPECTED_5 = [
  ['by', 'By', 'City, town', 'bue', '[ˈbyˀ]', 'City, or town. Say ee with your lips rounded.'],
  ['gade', 'Gade', 'Street', 'GEH-thuh', '[ˈɡæːðə]', 'Street. The d is soft, like th in this.'],
  ['bus', 'Bus', 'Bus', 'boos', '[ˈbus]', 'Bus. Close to the English word, with a short oo.'],
  ['tog', 'Tog', 'Train', 'taw', '[ˈtɔˀw]', 'Train. The g is not said; it glides into a w.'],
  ['station', 'Station', 'Station', 'stah-SHOHN', '[sdaˈɕoˀn]', 'Station. The stress is on the last syllable, and ti sounds like sh.'],
  ['butik', 'Butik', 'Shop', 'boo-TEEG', '[buˈtiɡ]', 'Shop. The k at the end sounds like a g.'],
  ['hus', 'Hus', 'House', 'hoos', '[ˈhuˀs]', 'House. The voice catches after the u.'],
  ['cykel', 'Cykel', 'Bicycle', 'SUE-gull', '[ˈsyɡəl]', 'Bicycle. The c is an s, and the y is ee with rounded lips.'],
  ['bro', 'Bro', 'Bridge', 'broh', '[ˈbʁoˀ]', 'Bridge. The Danish r is made at the back of the throat.'],
  ['torv', 'Torv', 'Square', 'tor', '[ˈtɒˀw]', 'Town square, or market square. The rv sounds like a w.'],
]

const [lesson, lesson2, lesson3, lesson4, lesson5] = lessons
const table = (l: typeof lesson) => l.entries.map((e) => [e.id, e.da, e.en, e.respelling, e.ipa, e.note])

describe('catalog', () => {
  it('has the lessons in order with their titles, colours and gables', () => {
    expect(lessons.map((l) => l.id)).toEqual(['hej-og-tak', 'hvem-er-du', 'tal', 'mad-og-drikke', 'byen'])
    expect(lesson).toMatchObject({ title: 'Hej og tak', titleEn: 'Hello and thanks', color: 'gul', gable: 'step' })
    expect(lesson2).toMatchObject({ title: 'Hvem er du?', titleEn: 'Who are you?', color: 'tegl', gable: 'point' })
    expect(lesson3).toMatchObject({ title: 'Tal', titleEn: 'Numbers', color: 'hav', gable: 'bell' })
    expect(lesson4).toMatchObject({ title: 'Mad og drikke', titleEn: 'Food and drink', color: 'salvie', gable: 'cornice' })
    expect(lesson5).toMatchObject({ title: 'Byen', titleEn: 'The city', color: 'rosa', gable: 'step' })
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

  it('has the ten entries of lessons 3, 4 and 5 in order, character for character', () => {
    expect(table(lesson3)).toEqual(EXPECTED_3)
    expect(table(lesson4)).toEqual(EXPECTED_4)
    expect(table(lesson5)).toEqual(EXPECTED_5)
  })

  it('has the praise words', () => {
    expect(lesson.praise).toEqual({ da: 'Velkommen', en: 'Welcome', respelling: 'VEL-kum-en', ipa: '[ˈvɛlˌkʌmˀən]' })
    expect(lesson2.praise).toEqual({ da: 'Flot', en: 'Well done', respelling: 'flut', ipa: '[ˈflʌd]' })
    expect(lesson3.praise).toEqual({ da: 'Super', en: 'Great', respelling: 'SOO-buh', ipa: '[ˈsuˀbʌ]' })
    expect(lesson4.praise).toEqual({ da: 'Velbekomme', en: 'Enjoy your meal', respelling: 'VEL-buh-KUM-uh', ipa: '[ˈvɛlbəˈkʌmˀə]' })
    expect(lesson5.praise).toEqual({ da: 'Hyggeligt', en: 'Lovely', respelling: 'HEW-guh-lid', ipa: '[ˈhyɡəlid]' })
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
