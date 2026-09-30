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

export const lessons: readonly Lesson[] = [hejOgTak]

export function getLesson(id: string | undefined): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}

export function totalEntries(): number {
  return lessons.reduce((n, l) => n + l.entries.length, 0)
}
