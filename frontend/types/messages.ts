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

export interface InitialiseData {
  message: string;
}

export interface ErrorData {
  error: string;
}

export interface ProcessedMessage {
  payload: ProcessedData;
  type: 'audio';
}

export interface InitialiseMessage {
  payload: InitialiseData;
  type: 'initialized';
}

export interface ErrorMessage {
  payload: ErrorData;
  type: 'error';
}

export type WebSocketMessage =
  | ProcessedMessage
  | InitialiseMessage
  | ErrorMessage;
