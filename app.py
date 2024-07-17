#! python3.7

import argparse
import os
import numpy as np
import speech_recognition as sr
import whisper
import torch
import soundfile as sf
from pydub import AudioSegment

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


def load_or_download_translation_model(model_name):
    local_dir = f"local_model_{current_lang}"
    if os.path.exists(local_dir):
        tokenizer = MarianTokenizer.from_pretrained(local_dir)
        translation_model = MarianMTModel.from_pretrained(local_dir)
    else:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        translation_model = MarianMTModel.from_pretrained(model_name)
        tokenizer.save_pretrained(local_dir)
        translation_model.save_pretrained(local_dir)
    return tokenizer, translation_model


def translate_text(text, tokenizer, model):
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    translated = model.generate(**inputs)
    translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
    return translated_text


def load_silero_model(repo_or_dir='snakers4/silero-models', model_name='silero_tts', language='ua', speaker='v4_ua'):
    return torch.hub.load(repo_or_dir=repo_or_dir, model=model_name, language=language, speaker=speaker)


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
    parser.add_argument("--model", default="tiny.en", help="Model to use",
                        choices=["tiny", "base", "small", "medium", "large"])
    parser.add_argument("--energy_threshold", default=1000,
                        help="Energy level for mic to detect.", type=int)
    parser.add_argument("--record_timeout", default=2,
                        help="How real time the recording is in seconds.", type=float)
    parser.add_argument("--phrase_timeout", default=2,
                        help="How much empty space between recordings before we "
                             "consider it a new line in the transcription.", type=float)
    parser.add_argument("--default_microphone", default='pulse',
                        help="Default microphone name for SpeechRecognition. "
                             "Run this with 'list' to view available Microphones.", type=str)
    args = parser.parse_args()

    phrase_time = None
    data_queue = Queue()
    recorder = sr.Recognizer()
    recorder.energy_threshold = args.energy_threshold
    recorder.dynamic_energy_threshold = False

    source = configure_microphone(args.default_microphone)
    if source is None:
        return

    model = args.model
    audio_model = whisper.load_model(model)
    record_timeout = args.record_timeout
    phrase_timeout = args.phrase_timeout

    transcription = ['']

    with source:
        recorder.adjust_for_ambient_noise(source)

    def record_callback(_, audio: sr.AudioData) -> None:
        timestamp = datetime.utcnow()
        data_queue.put((timestamp, audio.get_raw_data()))

    recorder.listen_in_background(source, record_callback, phrase_time_limit=record_timeout)

    print("Model loaded.\n")

    tokenizer, translation_model = load_or_download_translation_model(lang_settings[current_lang]['translation_model'])
    tts_model, example_text = load_silero_model(language=current_lang, speaker=lang_settings[current_lang]['speaker'])
    tts_model.to(torch.device('cpu'))

    audio_stream = []

    while True:
        try:
            now = datetime.utcnow()
            if not data_queue.empty():
                phrase_complete = False
                if phrase_time and now - phrase_time > timedelta(seconds=phrase_timeout):
                    phrase_complete = True
                phrase_time = now

                timestamp, audio_data = data_queue.get()
                audio_data = b''.join([audio_data])

                audio_segment = AudioSegment(
                    data=audio_data,
                    sample_width=2,
                    frame_rate=16000,
                    channels=1
                )
                audio_segment = audio_segment.normalize()
                samples = np.array(audio_segment.get_array_of_samples())
                audio_np = samples.astype(np.float32) / 32768.0

                result = audio_model.transcribe(audio_np, fp16=torch.cuda.is_available())
                text = result['text'].strip()

                if text:
                    translated_text = translate_text(text, tokenizer, translation_model)
                    audio = tts_model.apply_tts(text=translated_text, speaker=lang_settings[current_lang]['speaker_name'], sample_rate=48000)
                    synthesis_timestamp = datetime.utcnow()
                    synthesis_delay = (synthesis_timestamp - timestamp).total_seconds()

                    audio_stream.extend(audio)

                    if phrase_complete:
                        transcription.append(translated_text)
                    else:
                        transcription[-1] = translated_text

                    print(f"[{timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {translated_text} ({text})")
                    print(f"Synthesis delay: {synthesis_delay:.2f} seconds")
            else:
                sleep(0.25)
        except KeyboardInterrupt:
            break

    os.makedirs('audio', exist_ok=True)
    sf.write('audio/translated_audio.wav', np.array(audio_stream), 48000)


if __name__ == "__main__":
    main()
