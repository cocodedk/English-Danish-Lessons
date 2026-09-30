import type { LessonColor } from './types'

export type SoundExample = {
  id: string
  da: string
  en: string
  respelling: string
  ipa: string
  tip: string
}

export type SoundCard = {
  id: string
  mark: string
  color: LessonColor
  title: string
  paragraphs: readonly string[]
  examples: readonly SoundExample[]
}

export const sounds: readonly SoundCard[] = [
  {
    id: 'vowels',
    mark: 'æ ø å',
    color: 'gul',
    title: 'Three extra letters',
    paragraphs: ['Danish ends its alphabet with æ, ø and å. None of them is hard once you hear it.'],
    examples: [
      { id: 'aeble', da: 'Æble', en: 'Apple', respelling: 'EH-bluh', ipa: '[ˈɛːblə]', tip: 'æ is like the e in bet, held a little longer.' },
      { id: 'oel', da: 'Øl', en: 'Beer', respelling: 'url', ipa: '[ˈøl]', tip: 'ø is like ur in fur, without the r.' },
      { id: 'aar', da: 'År', en: 'Year', respelling: 'aw', ipa: '[ˈɒˀ]', tip: 'å is like the aw in law. The voice catches at the end.' },
    ],
  },
  {
    id: 'soft-d',
    mark: 'd',
    color: 'hav',
    title: 'The soft d',
    paragraphs: [
      'After a vowel, d is often soft. Put your tongue where you put it for th in this, and do not push.',
      'You will meet it in many of the most common words.',
    ],
    examples: [
      { id: 'mad', da: 'Mad', en: 'Food', respelling: 'mahth', ipa: '[ˈmað]', tip: 'The d at the end is a soft th.' },
      { id: 'roed', da: 'Rød', en: 'Red', respelling: 'rurth', ipa: '[ˈʁœðˀ]', tip: 'A soft th again, and the voice catches at the end.' },
      { id: 'gade', da: 'Gade', en: 'Street', respelling: 'GEH-thuh', ipa: '[ˈɡæːðə]', tip: 'The d between two vowels is soft too.' },
    ],
  },
  {
    id: 'r',
    mark: 'r',
    color: 'tegl',
    title: 'The Danish r',
    paragraphs: [
      'Danish r is made far back in the throat, close to a gentle gargle.',
      'After a vowel it often fades into a short uh.',
    ],
    examples: [
      { id: 'tre', da: 'Tre', en: 'Three', respelling: 'treh', ipa: '[ˈtʁɛˀ]', tip: 'The r comes from the back of the throat.' },
      { id: 'bro', da: 'Bro', en: 'Bridge', respelling: 'broh', ipa: '[ˈbʁoˀ]', tip: 'Same r, after the b.' },
      { id: 'bror', da: 'Bror', en: 'Brother', respelling: 'broa', ipa: '[ˈbʁoɐ̯]', tip: 'One syllable: the last r fades into a short uh glide.' },
    ],
  },
  {
    id: 'stoed',
    mark: 'ˀ',
    color: 'salvie',
    title: 'The stød',
    paragraphs: [
      'Some Danish syllables end in a tiny catch in the voice, like the pause in uh-oh.',
      'It changes the word: hun is she, and hund is dog.',
    ],
    examples: [
      { id: 'hun', da: 'Hun', en: 'She', respelling: 'hoon', ipa: '[ˈhun]', tip: 'No catch. The sound runs straight on.' },
      { id: 'hund', da: 'Hund', en: 'Dog', respelling: 'hoon (with a catch)', ipa: '[ˈhunˀ]', tip: 'The same sounds plus the catch at the end.' },
      { id: 'mand', da: 'Mand', en: 'Man', respelling: 'mahn (with a catch)', ipa: '[ˈmanˀ]', tip: 'Another word with the catch.' },
    ],
  },
]
