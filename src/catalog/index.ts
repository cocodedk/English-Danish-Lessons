import type { Lesson } from './types'

export type { Entry, Gable, Lesson, LessonColor } from './types'

const hejOgTak: Lesson = {
  id: 'hej-og-tak',
  title: 'Hej og tak',
  titleEn: 'Hello and thanks',
  color: 'gul',
  gable: 'step',
  entries: [
    { id: 'hej', da: 'Hej', en: 'Hello', respelling: 'hi', ipa: '[ˈhɑj]', note: 'Hello, or hi. Say it twice, hej hej, to mean bye.' },
    { id: 'goddag', da: 'Goddag', en: 'Good day', respelling: 'go-DEH', ipa: '[ɡoˈdæˀ]', note: 'A polite hello, good for meeting someone new.' },
    { id: 'tak', da: 'Tak', en: 'Thanks', respelling: 'tahg', ipa: '[ˈtɑɡ]', note: 'Thanks. You will say it all day.' },
    { id: 'mange-tak', da: 'Mange tak', en: 'Thank you very much', respelling: 'MAHNG-uh tahg', ipa: '[ˈmɑŋə ˈtɑɡ]', note: 'Literally, many thanks.' },
    { id: 'ja', da: 'Ja', en: 'Yes', respelling: 'yeh', ipa: '[ˈja]', note: 'Yes. Short and light.' },
    { id: 'nej', da: 'Nej', en: 'No', respelling: 'nigh', ipa: '[ˈnɑjˀ]', note: 'No. The voice stops for a moment at the end. Danes call that catch stød.' },
    { id: 'undskyld', da: 'Undskyld', en: 'Sorry', respelling: 'ON-skewl', ipa: '[ˈɔnˌsɡylˀ]', note: 'Sorry, or excuse me when you need to get past.' },
    { id: 'farvel', da: 'Farvel', en: 'Goodbye', respelling: 'fah-VEL', ipa: '[fɑˈvɛl]', note: 'Goodbye. It sounds more final than hej hej.' },
  ],
  praise: { da: 'Velkommen', en: 'Welcome', respelling: 'VEL-kum-en', ipa: '[ˈvɛlˌkʌmˀən]' },
}

const hvemErDu: Lesson = {
  id: 'hvem-er-du',
  title: 'Hvem er du?',
  titleEn: 'Who are you?',
  color: 'tegl',
  gable: 'point',
  entries: [
    { id: 'jeg', da: 'Jeg', en: 'I', respelling: 'yai', ipa: '[ˈjɑj]', note: 'I. It is written with an e but said yai.' },
    { id: 'du', da: 'Du', en: 'You', respelling: 'doo', ipa: '[ˈdu]', note: 'You, to one person. Say it like the English word do.' },
    { id: 'hvad-hedder-du', da: 'Hvad hedder du?', en: 'What is your name?', respelling: 'va HEH-ther doo', ipa: '[va ˈheðɐ du]', note: 'Literally, what are you called. The h in hv is silent.' },
    { id: 'jeg-hedder', da: 'Jeg hedder …', en: 'My name is …', respelling: 'yai HEH-ther', ipa: '[jɑj ˈheðɐ]', note: 'Say your own name after it. The dd is soft, like th in this.' },
    { id: 'hvordan-har-du-det', da: 'Hvordan har du det?', en: 'How are you?', respelling: 'vor-DAN hah doo DEH', ipa: '[vɒˈdan hɑ du ˈde]', note: 'Literally, how have you it.' },
    { id: 'godt', da: 'Godt', en: 'Good, fine', respelling: 'gut', ipa: '[ˈɡʌd]', note: 'Good, or fine: the usual answer to how are you.' },
    { id: 'og-dig', da: 'Og dig?', en: 'And you?', respelling: 'ow dai', ipa: '[ɒw dɑj]', note: 'And you? Og means and.' },
    { id: 'hyggeligt-at-moede', da: 'Hyggeligt at møde dig', en: 'Nice to meet you', respelling: 'HEW-guh-lid uh MUR-thuh dai', ipa: '[ˈhyɡəlid ʌ ˈmøːðə dɑj]', note: 'Nice to meet you. Hyggelig is the Danish word for cosy and friendly.' },
  ],
  praise: { da: 'Flot', en: 'Well done', respelling: 'flut', ipa: '[ˈflʌd]' },
}

const tal: Lesson = {
  id: 'tal',
  title: 'Tal',
  titleEn: 'Numbers',
  color: 'hav',
  gable: 'bell',
  entries: [
    { id: 'en', da: 'En', en: 'One', respelling: 'ehn', ipa: '[ˈeˀn]', note: 'One. Before a noun Danes use en or et, depending on the noun.' },
    { id: 'to', da: 'To', en: 'Two', respelling: 'toe', ipa: '[ˈtoˀ]', note: 'Two. The voice catches at the end.' },
    { id: 'tre', da: 'Tre', en: 'Three', respelling: 'treh', ipa: '[ˈtʁɛˀ]', note: 'Three. The Danish r is made at the back of the throat.' },
    { id: 'fire', da: 'Fire', en: 'Four', respelling: 'FEE-uh', ipa: '[ˈfiːʌ]', note: 'Four. Two syllables.' },
    { id: 'fem', da: 'Fem', en: 'Five', respelling: 'fem', ipa: '[ˈfɛmˀ]', note: 'Five. The m has a small catch at the end.' },
    { id: 'seks', da: 'Seks', en: 'Six', respelling: 'sehgs', ipa: '[ˈsɛɡs]', note: 'Six. The k sounds like a g.' },
    { id: 'syv', da: 'Syv', en: 'Seven', respelling: 'sue', ipa: '[ˈsywˀ]', note: 'Seven. Say ee with your lips rounded, as if for oo.' },
    { id: 'otte', da: 'Otte', en: 'Eight', respelling: 'OH-duh', ipa: '[ˈɔːdə]', note: 'Eight. The tt sounds like a d.' },
    { id: 'ni', da: 'Ni', en: 'Nine', respelling: 'nee', ipa: '[ˈniˀ]', note: 'Nine. Like the English word knee.' },
    { id: 'ti', da: 'Ti', en: 'Ten', respelling: 'tee', ipa: '[ˈtiˀ]', note: 'Ten. Like the English word tea, with a catch at the end.' },
  ],
  praise: { da: 'Super', en: 'Great', respelling: 'SOO-buh', ipa: '[ˈsuˀbʌ]' },
}

const madOgDrikke: Lesson = {
  id: 'mad-og-drikke',
  title: 'Mad og drikke',
  titleEn: 'Food and drink',
  color: 'salvie',
  gable: 'cornice',
  entries: [
    { id: 'vand', da: 'Vand', en: 'Water', respelling: 'van', ipa: '[ˈvanˀ]', note: 'Water. The first word to know in a café.' },
    { id: 'kaffe', da: 'Kaffe', en: 'Coffee', respelling: 'KAH-fuh', ipa: '[ˈkɑfə]', note: 'Coffee. Stress the first syllable.' },
    { id: 'te', da: 'Te', en: 'Tea', respelling: 'teh', ipa: '[ˈteˀ]', note: 'Tea. Short, with a small catch at the end.' },
    { id: 'maelk', da: 'Mælk', en: 'Milk', respelling: 'melg', ipa: '[ˈmɛlˀɡ]', note: 'Milk. The k at the end sounds like a g.' },
    { id: 'oel', da: 'Øl', en: 'Beer', respelling: 'url', ipa: '[ˈøl]', note: 'Beer. Say ur without the r.' },
    { id: 'broed', da: 'Brød', en: 'Bread', respelling: 'brurth', ipa: '[ˈbʁœðˀ]', note: 'Bread. The d is soft, like th in this.' },
    { id: 'smoer', da: 'Smør', en: 'Butter', respelling: 'smur', ipa: '[ˈsmɶɐ̯]', note: 'Butter. The ø glides into a soft r.' },
    { id: 'ost', da: 'Ost', en: 'Cheese', respelling: 'awst', ipa: '[ˈɔsd]', note: 'Cheese. The last t sounds like a d.' },
    { id: 'aeble', da: 'Æble', en: 'Apple', respelling: 'EH-bluh', ipa: '[ˈɛːblə]', note: 'Apple. The æ is like the e in bet, held a little longer.' },
    { id: 'suppe', da: 'Suppe', en: 'Soup', respelling: 'SAW-buh', ipa: '[ˈsɔbə]', note: 'Soup. The pp sounds like a b.' },
  ],
  praise: { da: 'Velbekomme', en: 'Enjoy your meal', respelling: 'VEL-buh-KUM-uh', ipa: '[ˈvɛlbəˈkʌmˀə]' },
}

const byen: Lesson = {
  id: 'byen',
  title: 'Byen',
  titleEn: 'The city',
  color: 'rosa',
  gable: 'step',
  entries: [
    { id: 'by', da: 'By', en: 'City, town', respelling: 'bue', ipa: '[ˈbyˀ]', note: 'City, or town. Say ee with your lips rounded.' },
    { id: 'gade', da: 'Gade', en: 'Street', respelling: 'GEH-thuh', ipa: '[ˈɡæːðə]', note: 'Street. The d is soft, like th in this.' },
    { id: 'bus', da: 'Bus', en: 'Bus', respelling: 'boos', ipa: '[ˈbus]', note: 'Bus. Close to the English word, with a short oo.' },
    { id: 'tog', da: 'Tog', en: 'Train', respelling: 'taw', ipa: '[ˈtɔˀw]', note: 'Train. The g is not said; it glides into a w.' },
    { id: 'station', da: 'Station', en: 'Station', respelling: 'stah-SHOHN', ipa: '[sdaˈɕoˀn]', note: 'Station. The stress is on the last syllable, and ti sounds like sh.' },
    { id: 'butik', da: 'Butik', en: 'Shop', respelling: 'boo-TEEG', ipa: '[buˈtiɡ]', note: 'Shop. The k at the end sounds like a g.' },
    { id: 'hus', da: 'Hus', en: 'House', respelling: 'hoos', ipa: '[ˈhuˀs]', note: 'House. The voice catches after the u.' },
    { id: 'cykel', da: 'Cykel', en: 'Bicycle', respelling: 'SUE-gull', ipa: '[ˈsyɡəl]', note: 'Bicycle. The c is an s, and the y is ee with rounded lips.' },
    { id: 'bro', da: 'Bro', en: 'Bridge', respelling: 'broh', ipa: '[ˈbʁoˀ]', note: 'Bridge. The Danish r is made at the back of the throat.' },
    { id: 'torv', da: 'Torv', en: 'Square', respelling: 'tor', ipa: '[ˈtɒˀw]', note: 'Town square, or market square. The rv sounds like a w.' },
  ],
  praise: { da: 'Hyggeligt', en: 'Lovely', respelling: 'HEW-guh-lid', ipa: '[ˈhyɡəlid]' },
}

export const lessons: readonly Lesson[] = [hejOgTak, hvemErDu, tal, madOgDrikke, byen]

/** How many houses the street will have; the empty plot shows until the catalog reaches it. */
export const PLANNED_LESSONS = 5

export function getLesson(id: string | undefined): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export function totalEntries(): number {
  return lessons.reduce((n, l) => n + l.entries.length, 0)
}
