import os
import numpy as np
import whisper_timestamped as whisper
import torch
from pydub import AudioSegment
from datetime import datetime
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


def load_silero_model(language):
    return torch.hub.load(repo_or_dir='snakers4/silero-models', model='silero_tts', language=language, speaker=lang_settings[language]['speaker'])


class AudioProcessor:
    def __init__(self, language, model_name, sample_rate=24000):
        self.language = language
        self.sample_rate = sample_rate
        self.audio_model = whisper.load_model(model_name)
        self.tokenizer, self.translation_model = load_or_download_translation_model(language)
        self.tts_model, self.example_text = load_silero_model(language)
        self.tts_model.to(torch.device('cpu'))

    def translate_text(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", padding=True)
        translated = self.translation_model.generate(**inputs)
        translated_text = self.tokenizer.batch_decode(translated, skip_special_tokens=True)
        return translated_text[0]

    def synthesize_speech(self, text):
        audio = self.tts_model.apply_tts(text=text, sample_rate=self.sample_rate, speaker=lang_settings[self.language]['speaker_name'])
        return audio

    def process_audio(self, timestamp, audio_data):
        audio_segment = AudioSegment(
            data=audio_data,
            sample_width=2,
            frame_rate=16000,
            channels=1
        )
        audio_segment = audio_segment.normalize()
        samples = np.array(audio_segment.get_array_of_samples())
        audio_np = samples.astype(np.float32) / 32768.0

        result = self.audio_model.transcribe(audio_np, fp16=torch.cuda.is_available())
        segments = result['segments']

        translated_segments = []
        for segment in segments:
            translated_text = self.translate_text(segment['text'])
            translated_segments.append({
                'start': segment['start'],
                'end': segment['end'],
                'text': translated_text
            })

        final_audio = np.array([])
        for segment in translated_segments:
            synthesized_segment = self.synthesize_speech(segment['text'])
            silence_duration = int((segment['start'] * self.sample_rate) - len(final_audio))
            if silence_duration > 0:
                final_audio = np.pad(final_audio, (0, silence_duration), 'constant')
            final_audio = np.concatenate((final_audio, synthesized_segment), axis=None)

        synthesis_timestamp = datetime.utcnow()
        synthesis_delay = (synthesis_timestamp - timestamp).total_seconds()

        log_data = {
            "timestamp": timestamp,
            "original_text": segments[-1]['text'],
            "translated_text": translated_segments[-1]['text'],
            "synthesis_delay": synthesis_delay
        }

        return final_audio, log_data
