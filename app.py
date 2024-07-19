import argparse
import os
import numpy as np
import speech_recognition as sr
import soundfile as sf
from datetime import datetime
from queue import Queue
from time import sleep
from sys import platform

from audioProcessorV1 import AudioProcessor

def configure_microphone(default_microphone=None):
    if 'linux' in platform:
        mic_name = default_microphone or 'pulse'
        if mic_name == 'list':
            print("Available microphone devices are: ")
            for index, name in enumerate(sr.Microphone.list_microphone_names()):
                print(f"Microphone with name \"{name}\" found")
            return None
        else:
            for index, name in enumerate(sr.Microphone.list_microphone_names()):
                if mic_name in name:
                    return sr.Microphone(sample_rate=16000, device_index=index)
    return sr.Microphone(sample_rate=16000)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="small", help="Model to use",
                        choices=["tiny", "base", "small", "medium", "large"])
    parser.add_argument("--language", default="ua", help="Output language",
                        choices=["en", "ua", "ru", "fr", "de", "es"])
    parser.add_argument("--energy_threshold", default=1000,
                        help="Energy level for mic to detect.", type=int)
    parser.add_argument("--record_timeout", default=2,
                        help="How real time the recording is in seconds.", type=float)
    parser.add_argument("--default_microphone", default='pulse',
                        help="Default microphone name for SpeechRecognition. "
                             "Run this with 'list' to view available Microphones.", type=str)
    parser.add_argument("--sample_rate", default=24000, help="Sample rate for audio processing.", type=int)
    args = parser.parse_args()

    data_queue = Queue()
    recorder = sr.Recognizer()
    recorder.energy_threshold = args.energy_threshold
    recorder.dynamic_energy_threshold = False

    source = configure_microphone(args.default_microphone)
    if source is None:
        return

    audio_processor = AudioProcessor(args.language, args.model, args.sample_rate)
    record_timeout = args.record_timeout

    with source:
        recorder.adjust_for_ambient_noise(source)

    def record_callback(_, audio: sr.AudioData) -> None:
        timestamp = datetime.utcnow()
        data_queue.put((timestamp, audio.get_raw_data()))

    recorder.listen_in_background(source, record_callback, phrase_time_limit=record_timeout)

    print("Model loaded.\n")

    audio_stream = []

    while True:
        try:
            if not data_queue.empty():
                timestamp, audio_data = data_queue.get()
                final_audio, log_data = audio_processor.process_audio(timestamp, audio_data)

                print(f"[{log_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}] {log_data['translated_text']} ({log_data['original_text']})")
                print(f"Synthesis delay: {log_data['synthesis_delay']:.2f} seconds")

                audio_stream.extend(final_audio)
            else:
                sleep(0.25)
        except KeyboardInterrupt:
            break

    os.makedirs('audio', exist_ok=True)
    sf.write('audio/translated_audio.wav', np.array(audio_stream), args.sample_rate)

if __name__ == "__main__":
    main()
