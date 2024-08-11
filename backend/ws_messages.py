from typing import Dict, Any
from datetime import datetime


def create_initialize_response(message: str, session_id: str) -> Dict[str, Any]:
    return {
        'type': 'initialized',
        'payload': {"message": message, "session_id": session_id }
    }


def create_error_response(error: str) -> Dict[str, Any]:
    return {
        'type': 'error',
        'payload': {"error": error}
    }


def create_audio_processed_response(base64_audio: str, log_data: Dict[str, Any]) -> Dict[str, Any]:
    timestamp = log_data.get('timestamp', datetime.utcnow())

    return {
        'type': 'audio_processed',
        'payload': {
            "timestamp": timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "original_text": log_data.get('original_text', ""),
            "translated_text": log_data.get('translated_text', ""),
            "synthesis_delay": log_data.get('synthesis_delay', 0),
            "recognize_result": log_data.get('recognize_result', {}),
            "audio": base64_audio,
            "error": log_data.get('error', "")
        }
    }


def create_translated_audio_response(base64_audio: str, log_data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'type': 'translated_audio',
        'payload': {
            "translatedAudio": f"data:audio/mpeg;base64,{base64_audio}",
            "logData": log_data,
        }
    }


def create_translated_text_response(translated_audio: str, translated_text: str) -> Dict[str, Any]:
    return {
        'type': 'translated_text',
        'payload': {
            "translatedAudio": f"data:audio/mpeg;base64,{translated_audio}",
            "translatedText": translated_text,
        }
    }


def create_join_response(success: bool, session_id: str) -> Dict[str, Any]:
    return {'type': 'joined_session', 'payload': {'success': success, 'session_id': session_id}}


def create_opponent_audio_response(base64_audio: str, log_data: Dict[str, Any]) -> Dict[str, Any]:
    timestamp = log_data.get('timestamp', datetime.utcnow())

    return {
        'type': 'conversation_audio',
        'payload': {
            'audio': base64_audio,
            "timestamp": timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "original_text": log_data.get('original_text', ""),
            "translated_text": log_data.get('translated_text', ""),
            "synthesis_delay": log_data.get('synthesis_delay', 0),
            "recognize_result": log_data.get('recognize_result', {}),
            "error": log_data.get('error', "")
        }
    }


def create_opponent_joined(session_id: str) -> Dict[str, Any]:
    return {
        'type': 'opponent_joined',
        'payload': {
            'session_id': session_id,
        }
    }


def create_opponent_left(session_id: str) -> Dict[str, Any]:
    return {
        'type': 'opponent_left',
        'payload': {
            'session_id': session_id,
        }
    }
