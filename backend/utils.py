from io import BytesIO
import base64

import numpy as np
from pydub import AudioSegment
import soundfile as sf

SAMPLE_RATE = 24000
SAMPLE_WIDTH = 2
CHANNELS = 1
EXPECTED_SILENCE_DURATION = 0.5
SILENCE_THRESHOLD = 500


def is_silent(data_chunk) -> bool:
    audio_samples = np.frombuffer(data_chunk, dtype=np.int16)
    return np.mean(np.abs(audio_samples)) < SILENCE_THRESHOLD


def audio_base64_to_bytes(file_base64: str, audio_format="mp3") -> bytes:
    file_data = base64.b64decode(file_base64.split(';base64,')[-1])
    audio_segment = AudioSegment.from_file(BytesIO(file_data),  format=audio_format)
    audio_segment = audio_segment.set_frame_rate(SAMPLE_RATE).set_channels(CHANNELS).set_sample_width(SAMPLE_WIDTH)
    audio_data = np.array(audio_segment.get_array_of_samples())
    return audio_data.tobytes()


def audio_bytes_to_base64(file_bytes: np.ndarray, audio_format="mp3") -> str:
    output_io = BytesIO()
    sf.write(output_io, file_bytes, SAMPLE_RATE, format=audio_format)
    return base64.b64encode(output_io.getvalue()).decode('utf-8')
