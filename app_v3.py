import argparse
import os
import numpy as np
import speech_recognition as sr
import whisper_timestamped as whisper
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
        'translation_key': 'uk',
        'speaker': 'v4_ua',
        'speaker_name': 'mykyta'
    },
    'ru': {
        'translation_key': 'ru',
        'speaker': 'v4_ru',
        'speaker_name': 'aidar'
    },
    'fr': {
        'translation_key': 'fr',
        'speaker': 'v3_fr',
        'speaker_name': 'fr_0'
    },
    'de': {
        'translation_key': 'de',
        'speaker': 'v3_de',
        'speaker_name': 'karlsson'
    },
    'es': {
        'translation_key': 'es',
        'speaker': 'v3_es',
        'speaker_name': 'es_0'
    },
    'en': {
        'translation_key': 'en',
        'speaker': 'v3_en',
        'speaker_name': 'en_0'
    }
}

def load_or_download_translation_model(language):
    model_name = f"Helsinki-NLP/opus-mt-en-{lang_settings[language]['translation_key']}"
    local_dir = f"local_model_{language}"
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
    translated_text = tokenizer.batch_decode(translated, skip_special_tokens=True)
    return translated_text[0]

def load_silero_model(repo_or_dir='snakers4/silero-models', model_name='silero_tts', language='ua', speaker='v4_ua'):
    return torch.hub.load(repo_or_dir=repo_or_dir, model=model_name, language=language, speaker=speaker)

def synthesize_speech(text, model, language, sample_rate=24000):
    audio = model.apply_tts(text=text, sample_rate=sample_rate, speaker=lang_settings[language]['speaker_name'])
    return audio

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

    transcription = []

    with source:
        recorder.adjust_for_ambient_noise(source)

    def record_callback(_, audio: sr.AudioData) -> None:
        timestamp = datetime.utcnow()
        data_queue.put((timestamp, audio.get_raw_data()))

    recorder.listen_in_background(source, record_callback, phrase_time_limit=record_timeout)

    print("Model loaded.\n")

    tokenizer, translation_model = load_or_download_translation_model(language=args.language)
    tts_model, example_text = load_silero_model(language=args.language, speaker=lang_settings[args.language]['speaker'])
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
                segments = result['segments']

                translated_segments = []
                for segment in segments:
                    translated_text = translate_text(segment['text'], tokenizer, translation_model)
                    translated_segments.append({
                        'start': segment['start'],
                        'end': segment['end'],
                        'text': translated_text
                    })

                final_audio = np.array([])
                for segment in translated_segments:
                    synthesized_segment = synthesize_speech(segment['text'], language=args.language, model=tts_model)
                    silence_duration = int((segment['start'] * 24000) - len(final_audio))
                    if silence_duration > 0:
                        final_audio = np.pad(final_audio, (0, silence_duration), 'constant')
                    final_audio = np.concatenate((final_audio, synthesized_segment), axis=None)

                synthesis_timestamp = datetime.utcnow()
                synthesis_delay = (synthesis_timestamp - timestamp).total_seconds()

                audio_stream.extend(final_audio)

                if phrase_complete:
                    transcription.append(translated_segments[-1]['text'])
                elif transcription:
                    transcription[-1] = translated_segments[-1]['text']

                print(f"[{timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {translated_segments[-1]['text']} ({segments[-1]['text']})")
                print(f"Synthesis delay: {synthesis_delay:.2f} seconds")
            else:
                sleep(0.25)
        except KeyboardInterrupt:
            break

    os.makedirs('audio', exist_ok=True)
    sf.write('audio/translated_audio.wav', np.array(audio_stream), 24000)

if __name__ == "__main__":
    main()
