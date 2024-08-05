from datetime import datetime
import numpy as np

from utils import is_silent, default_result, audio_bytes_to_base64
from babylon_sts import AudioProcessor

audio_processor = None
last_timestamp = None
buffered_audio = []


def combine_audio(raw_audio_data: np.ndarray):
    global buffered_audio
    buffered_audio.append(raw_audio_data)
    combined_audio = b''.join(buffered_audio)
    return combined_audio


def translate_audio(audio_data: bytes):
    if audio_processor is None:
        raise ValueError("Audio processor is not initialized. Use 'initialize' message before.")

    timestamp = datetime.utcnow()
    final_audio, log_data = audio_processor.process_audio(timestamp, audio_data)
    return audio_bytes_to_base64(final_audio), log_data


def process_buffered_audio(base64_audio: str):
    global audio_processor, buffered_audio

    if not buffered_audio:
        return

    combined_audio = b''.join(buffered_audio)
    buffered_audio = []

    if is_silent(combined_audio):
        return default_result(base64_audio, "Audio too silent")

    try:
        processed_file_base64, log_data = translate_audio(combined_audio)

        return {
            "timestamp": log_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
            "original_text": log_data['original_text'],
            "translated_text": log_data['translated_text'],
            "synthesis_delay": log_data['synthesis_delay'],
            "recognize_result": log_data['recognize_result'],
            "audio": processed_file_base64
        }
    except Exception as e:
        print(f"Translation error: {e}")
        return default_result(base64_audio, str(e))


def initialize_processor(language_to, language_from, model_name, sample_rate=24000):
    global audio_processor
    if language_from == 'en' and model_name != 'large':
        model_name = f"{model_name}.en"
    audio_processor = AudioProcessor(language_to=language_to, language_from=language_from, model_name=model_name, sample_rate=sample_rate)
