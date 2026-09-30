export type Entry = {
  id: string
  da: string
  en: string
  respelling: string
  ipa: string
  note: string
}

export type LessonColor = 'gul' | 'tegl' | 'hav' | 'salvie' | 'rosa'
export type Gable = 'step' | 'bell' | 'point' | 'cornice'

export type Lesson = {
  id: string
  title: string
  titleEn: string
  color: LessonColor
  gable: Gable
  entries: readonly Entry[]
  praise: Pick<Entry, 'da' | 'en' | 'respelling' | 'ipa'>
}
