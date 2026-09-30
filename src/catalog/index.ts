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

export const lessons: readonly Lesson[] = [hejOgTak, hvemErDu]

/** How many houses the street will have; the empty plot shows until the catalog reaches it. */
export const PLANNED_LESSONS = 5

export function getLesson(id: string | undefined): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export function totalEntries(): number {
  return lessons.reduce((n, l) => n + l.entries.length, 0)
}
