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


def create_join_response(success: bool):
    return {'type': 'join_session', 'payload': {'success': success}}


def create_opponent_audio_response(base64_audio: str):
    return {
        'type': 'conversation_audio',
        'payload': {
            'audio': base64_audio,
        }
    }