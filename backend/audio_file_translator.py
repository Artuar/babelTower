import numpy as np
import soundfile as sf
from datetime import datetime
from pydub import AudioSegment
from babylon_sts.processor import AudioProcessor

def process_local_audio(input_file: str, output_file: str, language: str = 'ru', model_name: str = 'small', sample_rate: int = 24000):
    # Using pydub to read the MP3 file
    audio_segment = AudioSegment.from_file(input_file)

    # Converting audio to a format supported for further processing
    audio_segment = audio_segment.set_frame_rate(sample_rate).set_channels(1)
    audio_data = np.array(audio_segment.get_array_of_samples())
    audio_data = audio_data.tobytes()  # Converting data to bytes

    # Creating an instance of AudioProcessor with the necessary parameters
    audio_processor = AudioProcessor(language=language, model_name=model_name, sample_rate=sample_rate)

    # Current time as a timestamp for processing
    timestamp = datetime.utcnow()

    try:
        # Processing the audio data
        final_audio, log_data = audio_processor.process_audio(timestamp, audio_data)

        # Saving the processed audio to a new file
        sf.write(output_file, final_audio, sample_rate)
    except ValueError as e:
        print(f"Error during synthesis: {e}")

# Calling the function to process the local file
process_local_audio('../audio/taken.mp3', 'audio/translated_audio.wav')
