export type TranslationModel = 'tiny' | 'base' | 'small' | 'medium' | 'large';

export interface ProcessedData {
  timestamp: string;
  original_text: string;
  translated_text: string;
  synthesis_delay: string;
  audio: string;
}
