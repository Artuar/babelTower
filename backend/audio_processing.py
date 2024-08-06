from datetime import datetime
import numpy as np
from utils import is_silent, audio_bytes_to_base64, SAMPLE_RATE, EXPECTED_SILENCE_DURATION, SAMPLE_WIDTH, CHANNELS
from babylon_sts import AudioProcessor


class AudioProcessorManager:
    def __init__(self):
        self.audio_processor = None
        self.last_timestamp = None
        self.buffered_audio = []

    def initialize_processor(self, language_to, language_from, model_name):
        if language_from == 'en' and model_name != 'large':
            model_name = f"{model_name}.en"
        self.audio_processor = AudioProcessor(
            language_to=language_to,
            language_from=language_from,
            model_name=model_name,
            sample_rate=SAMPLE_RATE
        )

    def translate_audio(self, audio_data: bytes):
        if self.audio_processor is None:
            raise ValueError("Audio processor is not initialized. Use 'initialize' method before.")

        timestamp = datetime.utcnow()
        final_audio, log_data = self.audio_processor.process_audio(timestamp, audio_data)
        return audio_bytes_to_base64(final_audio), log_data

    def collect_complete_phrase(self, raw_audio_data: bytes):
        self.buffered_audio.append(raw_audio_data)
        combined_audio = b''.join(self.buffered_audio)
        result = None

        last_silence_duration = int(EXPECTED_SILENCE_DURATION * SAMPLE_RATE * SAMPLE_WIDTH * CHANNELS)
        if len(combined_audio) >= last_silence_duration:
            # check if combined_audio ends with expected silence duration
            last_duration = combined_audio[-last_silence_duration:]
            if is_silent(last_duration):
                result = self.process_buffered_audio()

        return result

    def process_buffered_audio(self):
        if not self.buffered_audio:
            return

        combined_audio = b''.join(self.buffered_audio)
        self.buffered_audio = []

        if is_silent(combined_audio):
            return None, {"error": "Audio too silent"}

        try:
            processed_file_base64, log_data = self.translate_audio(combined_audio)
            return processed_file_base64, log_data
        except Exception as e:
            print(f"Translation error: {e}")
            return None, {"error": str(e)}