from typing import Tuple

import librosa as librosa
from pydub import AudioSegment
import numpy as np
from audio_separator.separator import Separator
import soundfile as sf
import tempfile
import os

audio_file_path = "short_whisky.mp3"

def load_and_normalize_audio(file_path: str, sample_rate: int = 24000) -> Tuple[np.ndarray, int]:
    try:
        audio_segment = AudioSegment.from_file(file_path, format="mp3")
        audio_segment = audio_segment.set_frame_rate(sample_rate).set_sample_width(2).set_channels(1)
        audio_len = len(audio_segment) / 1000
        audio_segment = audio_segment.normalize()
        samples = np.array(audio_segment.get_array_of_samples())
        audio_np = samples.astype(np.float32) / 32768.0
        return audio_np, audio_len
    except Exception as e:
        print(f"Error loading audio: {e}")
        return None

def adjust_audio_length(audio_np: np.ndarray, target_length: int) -> np.ndarray:
    current_length = len(audio_np)
    if current_length < target_length:
        padding_length = target_length - current_length
        padded_audio_np = np.pad(audio_np, (0, padding_length), 'constant')
        return padded_audio_np
    else:
        return audio_np[:target_length]

audio_np, audio_len = load_and_normalize_audio(audio_file_path)

if audio_np is not None:
    target_length = int(audio_len * (10 / 3)) * 24000

    adjusted_audio_np = adjust_audio_length(audio_np, target_length)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio_file:
        normalized_audio_path = temp_audio_file.name
        sf.write(normalized_audio_path, adjusted_audio_np, 24000, format='WAV')

    separator = Separator()
    separator.load_model()

    try:
        output_files = separator.separate(normalized_audio_path)

        background, sr = sf.read(output_files[0])
        voice, sr = sf.read(output_files[1])

        # Delete temporary files
        for file_path in output_files:
            os.remove(file_path)
        os.remove(normalized_audio_path)

        shortened_length = int(len(voice) // (10 / 3))
        voice = voice[:shortened_length]
        background = background[:shortened_length]

        sf.write("voice.mp3", voice, 44100, format='MP3')
        sf.write("background.mp3", background, 44100, format='MP3')


    except Exception as e:
        print(f"Error during separation: {e}")
else:
    print("Failed to load and normalize audio.")
