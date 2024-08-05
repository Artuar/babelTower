from io import BytesIO
import base64
import numpy as np
from datetime import datetime
from pydub import AudioSegment
import soundfile as sf


SILENCE_THRESHOLD = 500


def is_silent(data_chunk):
    audio_samples = np.frombuffer(data_chunk, dtype=np.int16)
    return np.mean(np.abs(audio_samples)) < SILENCE_THRESHOLD


def default_result(base64_audio: str, error=""):
    return {
        "timestamp": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
        "original_text": "",
        "translated_text": "",
        "synthesis_delay": 0,
        "audio": base64_audio,
        "error": error
    }


def audio_base64_to_bytes(file_base64: str, sample_rate=24000, audio_format="mp3"):
    file_data = base64.b64decode(file_base64.split(';base64,')[-1])
    audio_segment = AudioSegment.from_file(BytesIO(file_data),  format=audio_format)
    audio_segment = audio_segment.set_frame_rate(sample_rate).set_channels(1)
    audio_data = np.array(audio_segment.get_array_of_samples())
    return audio_data.tobytes()


def audio_bytes_to_base64(file_bytes: np.ndarray, sample_rate=24000, audio_format="mp3"):
    output_io = BytesIO()
    sf.write(output_io, file_bytes, sample_rate, format=audio_format)
    return base64.b64encode(output_io.getvalue()).decode('utf-8')