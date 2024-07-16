#! python3.7

import argparse
import os
import numpy as np
import speech_recognition as sr
import whisper
import torch
import soundfile as sf

from datetime import datetime, timedelta
from queue import Queue
from time import sleep
from sys import platform
from transformers import MarianMTModel, MarianTokenizer

lang_settings = {
    'ua': {
        'translation_model': 'Helsinki-NLP/opus-mt-en-uk',
        'speaker': 'v4_ua',
        'speaker_name': 'mykyta'
    },
    'ru': {
        'translation_model': 'Helsinki-NLP/opus-mt-en-ru',
        'speaker': 'v4_ru',
        'speaker_name': 'aidar'
    }
}
current_lang = 'ru'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="small", help="Model to use",
                        choices=["tiny", "base", "small", "medium", "large"])
    parser.add_argument("--energy_threshold", default=1000,
                        help="Energy level for mic to detect.", type=int)
    parser.add_argument("--record_timeout", default=2,
                        help="How real time the recording is in seconds.", type=float)
    parser.add_argument("--phrase_timeout", default=2,
                        help="How much empty space between recordings before we "
                             "consider it a new line in the transcription.", type=float)
    if 'linux' in platform:
        parser.add_argument("--default_microphone", default='pulse',
                            help="Default microphone name for SpeechRecognition. "
                                 "Run this with 'list' to view available Microphones.", type=str)
    args = parser.parse_args()

    # The last time a recording was retrieved from the queue.
    phrase_time = None
    # Thread safe Queue for passing data from the threaded recording callback.
    data_queue = Queue()
    # We use SpeechRecognizer to record our audio because it has a nice feature where it can detect when speech ends.
    recorder = sr.Recognizer()
    recorder.energy_threshold = args.energy_threshold
    # Definitely do this, dynamic energy compensation lowers the energy threshold dramatically to a point where the SpeechRecognizer never stops recording.
    recorder.dynamic_energy_threshold = False

    # Important for linux users.
    # Prevents permanent application hang and crash by using the wrong Microphone
    if 'linux' in platform:
        mic_name = args.default_microphone
        if not mic_name or mic_name == 'list':
            print("Available microphone devices are: ")
            for index, name in enumerate(sr.Microphone.list_microphone_names()):
                print(f"Microphone with name \"{name}\" found")
            return
        else:
            for index, name in enumerate(sr.Microphone.list_microphone_names()):
                if mic_name in name:
                    source = sr.Microphone(sample_rate=16000, device_index=index)
                    break
    else:
        source = sr.Microphone(sample_rate=16000)

    # Load / Download model
    model = args.model
    audio_model = whisper.load_model(model)

    record_timeout = args.record_timeout
    phrase_timeout = args.phrase_timeout

    transcription = ['']

    with source:
        recorder.adjust_for_ambient_noise(source)

    def record_callback(_, audio: sr.AudioData) -> None:
        """
        Threaded callback function to receive audio data when recordings finish.
        audio: An AudioData containing the recorded bytes.
        """
        # Grab the raw bytes and push it into the thread safe queue with timestamp.
        timestamp = datetime.utcnow()
        data_queue.put((timestamp, audio.get_raw_data()))

    # Create a background thread that will pass us raw audio bytes.
    # We could do this manually but SpeechRecognizer provides a nice helper.
    recorder.listen_in_background(source, record_callback, phrase_time_limit=record_timeout)

    # Cue the user that we're ready to go.
    print("Model loaded.\n")

    # Load translation model and tokenizer
    tokenizer, translation_model = load_or_download_translation_model()

    # Load TTS model
    tts_model, example_text = load_silero_model(language=current_lang, speaker=lang_settings[current_lang]['speaker'])
    tts_model.to(torch.device('cpu'))

    audio_stream = []

    while True:
        try:
            now = datetime.utcnow()
            # Pull raw recorded audio from the queue.
            if not data_queue.empty():
                phrase_complete = False
                # If enough time has passed between recordings, consider the phrase complete.
                # Clear the current working audio buffer to start over with the new data.
                if phrase_time and now - phrase_time > timedelta(seconds=phrase_timeout):
                    phrase_complete = True
                # This is the last time we received new audio data from the queue.
                phrase_time = now

                # Combine audio data from queue
                timestamp, audio_data = data_queue.get()
                audio_data = b''.join([audio_data])

                # Convert in-ram buffer to something the model can use directly without needing a temp file.
                # Convert data from 16 bit wide integers to floating point with a width of 32 bits.
                # Clamp the audio stream frequency to a PCM wavelength compatible default of 32768hz max.
                audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0

                # Read the transcription.
                result = audio_model.transcribe(audio_np, fp16=torch.cuda.is_available())
                text = result['text'].strip()

                if text:
                    # Translate the text
                    translated_text = translate_text(text, tokenizer, translation_model)

                    # Synthesize speech
                    audio = tts_model.apply_tts(text=translated_text, speaker=lang_settings[current_lang]['speaker_name'], sample_rate=48000)
                    synthesis_timestamp = datetime.utcnow()
                    synthesis_delay = (synthesis_timestamp - timestamp).total_seconds()

                    audio_stream.extend(audio)

                    # If we detected a pause between recordings, add a new item to our transcription.
                    # Otherwise edit the existing one.
                    if phrase_complete:
                        transcription.append(translated_text)
                    else:
                        transcription[-1] = translated_text

                    print(f"[{timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {translated_text}")
                    print(f"Synthesis delay: {synthesis_delay:.2f} seconds")
            else:
                # Infinite loops are bad for processors, must sleep.
                sleep(0.25)
        except KeyboardInterrupt:
            break

    # Save the audio stream to a file
    os.makedirs('audio', exist_ok=True)
    sf.write('audio/translated_audio.wav', np.array(audio_stream), 48000)

# Function to load or download the translation model
def load_or_download_translation_model(model_name=lang_settings[current_lang]['translation_model']):
    local_dir = f"local_model_{current_lang}"
    if os.path.exists(f"{local_dir}{current_lang}"):
        tokenizer = MarianTokenizer.from_pretrained(local_dir)
        translation_model = MarianMTModel.from_pretrained(local_dir)
    else:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        translation_model = MarianMTModel.from_pretrained(model_name)
        tokenizer.save_pretrained(local_dir)
        translation_model.save_pretrained(local_dir)
    return tokenizer, translation_model

# Function to translate text
def translate_text(text, tokenizer, model):
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    translated = model.generate(**inputs)
    translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
    return translated_text

# Function to load Silero TTS model
def load_silero_model(repo_or_dir='snakers4/silero-models', model_name='silero_tts', language='ua', speaker='v4_ua'):
    return torch.hub.load(repo_or_dir=repo_or_dir, model=model_name, language=language, speaker=speaker)

if __name__ == "__main__":
    main()
