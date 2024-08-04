interface InitializingData {
  language_from: string;
  language_to: string;
  model_name: string;
}

interface AudioData {
  audio: string;
}

interface TranslateAudioData {
  file: string;
}

interface InitializingMessage {
  payload: InitializingData;
  type: 'initialize';
}

interface ProcessingMessage {
  payload: AudioData;
  type: 'audio_data';
}

interface TranslateAudioMessage {
  payload: TranslateAudioData;
  type: 'translate_audio';
}

export type UserMessage =
  | InitializingMessage
  | ProcessingMessage
  | TranslateAudioMessage;
