export type TranslationModel = 'tiny' | 'base' | 'small' | 'medium' | 'large';

interface RecognizeResult {
  language: string;
  text: string;
}

export interface ProcessedData {
  timestamp: string;
  original_text: string;
  translated_text: string;
  synthesis_delay: string;
  audio: string;
  recognize_result: RecognizeResult;
}
