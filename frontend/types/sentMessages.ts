interface InitializingData {
  language_from: string;
  language_to: string;
  model_name: string;
}

interface AudioData {
  audio: string;
}

interface InitializingMessage {
  payload: InitializingData;
  type: 'initialize';
}

interface ProcessingMessage {
  payload: AudioData;
  type: 'audio_data';
}

export type UserMessage = InitializingMessage | ProcessingMessage;
