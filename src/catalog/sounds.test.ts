import { sounds } from './sounds'

const row = (e: (typeof sounds)[number]['examples'][number]) => [e.id, e.da, e.en, e.respelling, e.ipa, e.tip]

describe('sounds catalog', () => {
  it('has the four cards and twelve examples, character for character', () => {
    expect(sounds.map((s) => [s.id, s.mark, s.color, s.title, s.paragraphs])).toEqual([
      ['vowels', 'æ ø å', 'gul', 'Three extra letters', ['Danish ends its alphabet with æ, ø and å. None of them is hard once you hear it.']],
      ['soft-d', 'd', 'hav', 'The soft d', [
        'After a vowel, d is often soft. Put your tongue where you put it for th in this, and do not push.',
        'You will meet it in many of the most common words.',
      ]],
      ['r', 'r', 'tegl', 'The Danish r', [
        'Danish r is made far back in the throat, close to a gentle gargle.',
        'After a vowel it often fades into a short uh.',
      ]],
      ['stoed', 'ˀ', 'salvie', 'The stød', [
        'Some Danish syllables end in a tiny catch in the voice, like the pause in uh-oh.',
        'It changes the word: hun is she, and hund is dog.',
      ]],
    ])
    expect(sounds.map((s) => s.examples.map(row))).toEqual([
      [
        ['aeble', 'Æble', 'Apple', 'EH-bluh', '[ˈɛːblə]', 'æ is like the e in bet, held a little longer.'],
        ['oel', 'Øl', 'Beer', 'url', '[ˈøl]', 'ø is like ur in fur, without the r.'],
        ['aar', 'År', 'Year', 'aw', '[ˈɒˀ]', 'å is like the aw in law. The voice catches at the end.'],
      ],
      [
        ['mad', 'Mad', 'Food', 'mahth', '[ˈmað]', 'The d at the end is a soft th.'],
        ['roed', 'Rød', 'Red', 'rurth', '[ˈʁœðˀ]', 'A soft th again, and the voice catches at the end.'],
        ['gade', 'Gade', 'Street', 'GEH-thuh', '[ˈɡæːðə]', 'The d between two vowels is soft too.'],
      ],
      [
        ['tre', 'Tre', 'Three', 'treh', '[ˈtʁɛˀ]', 'The r comes from the back of the throat.'],
        ['bro', 'Bro', 'Bridge', 'broh', '[ˈbʁoˀ]', 'Same r, after the b.'],
        ['bror', 'Bror', 'Brother', 'broa', '[ˈbʁoɐ̯]', 'One syllable: the last r fades into a short uh glide.'],
      ],
      [
        ['hun', 'Hun', 'She', 'hoon', '[ˈhun]', 'No catch. The sound runs straight on.'],
        ['hund', 'Hund', 'Dog', 'hoon (with a catch)', '[ˈhunˀ]', 'The same sounds plus the catch at the end.'],
        ['mand', 'Mand', 'Man', 'mahn (with a catch)', '[ˈmanˀ]', 'Another word with the catch.'],
      ],
    ])
  })

  it('has unique ids, three examples per card, and four different facade colours', () => {
    const ids = [...sounds.map((s) => s.id), ...sounds.flatMap((s) => s.examples.map((e) => e.id))]
    expect(new Set(ids).size).toBe(ids.length)
    for (const card of sounds) expect(card.examples).toHaveLength(3)
    for (const { color } of sounds) expect(['gul', 'tegl', 'hav', 'salvie', 'rosa']).toContain(color)
    expect(new Set(sounds.map((s) => s.color)).size).toBe(4)
  })

  it('writes every IPA with the allowed symbols only', () => {
    const allowed = new Set(Array.from('[]ˈˌˀː abdefhijklmnostuvwyæðøŋœɐɑɒɔɕəɛɡɶʁʌ̯'))
    for (const { ipa } of sounds.flatMap((s) => s.examples)) {
      for (const char of Array.from(ipa)) expect(allowed.has(char), `${ipa}: ${char}`).toBe(true)
      expect(ipa).not.toMatch(/g/)
      expect(ipa).not.toMatch(/ε/)
    }
  })
})
