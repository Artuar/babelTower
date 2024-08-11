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

export interface InitialisedData {
  message: string;
  session_id: string;
}

export interface ErrorData {
  error: string;
}

export interface TranslatedAudio {
  translatedAudio: string;
}

export interface JoinedSession {
  success: boolean;
  session_id: string;
}

export interface OpponentAction {
  session_id: string;
}

export interface ErrorMessage {
  payload: ErrorData;
  type: 'error';
}

export interface ProcessedMessage {
  payload: ProcessedData;
  type: 'audio';
}

export interface InitialisedMessage {
  payload: InitialisedData;
  type: 'initialized';
}

export interface TranslatedAudioMessage {
  payload: TranslatedAudio;
  type: 'translated_audio';
}

export interface JoinedSessionMessage {
  payload: JoinedSession;
  type: 'joined_session';
}

export interface OpponentJoinedMessage {
  payload: OpponentAction;
  type: 'opponent_joined';
}

export interface OpponentLeftMessage {
  payload: OpponentAction;
  type: 'opponent_left';
}

export type WebSocketMessage =
  | ProcessedMessage
  | InitialisedMessage
  | ErrorMessage
  | TranslatedAudioMessage
  | JoinedSessionMessage
  | OpponentJoinedMessage
  | OpponentLeftMessage;
