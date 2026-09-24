export interface TutorProvider { enabled: boolean; explain(input: string): Promise<string | null> }
export interface DictionaryProvider { enabled: boolean; lookup(word: string): Promise<null | { definition: string }> }
export interface SpeechProvider { enabled: boolean; synthesize(text: string): Promise<null | ArrayBuffer> }
export interface PronunciationAssessmentProvider { enabled: boolean; assess(audio: ArrayBuffer, target: string): Promise<null | { score: number }> }

export const localDisabledProviders = {
  tutor: { enabled: false, async explain() { return null; } } satisfies TutorProvider,
  dictionary: { enabled: false, async lookup() { return null; } } satisfies DictionaryProvider,
  speech: { enabled: false, async synthesize() { return null; } } satisfies SpeechProvider,
  pronunciation: { enabled: false, async assess() { return null; } } satisfies PronunciationAssessmentProvider,
};
