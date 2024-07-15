import os
import whisper
from transformers import MarianMTModel, MarianTokenizer
import soundfile as sf
import torch
from datetime import datetime

# Функція для виведення з позначками часу
def print_with_timestamp(message):
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{current_time}] {message}")

# Функція для завантаження або завантаження та збереження моделі Silero
def load_silero_model(repo_or_dir='snakers4/silero-models', model_name='silero_tts', language='ua', speaker='v4_ua'):
    return torch.hub.load(repo_or_dir=repo_or_dir, model=model_name, language=language, speaker=speaker)

# Завантаження моделі Whisper
whisper_model = whisper.load_model("base")

# Завантаження аудіо файлу та підготовка його для розпізнавання
print_with_timestamp("Loading original audio")
audio = whisper.load_audio("audio/audio.mp3")
audio = whisper.pad_or_trim(audio)

# Створення лог-Мел спектрограм та перенесення на той самий пристрій, що і модель
mel = whisper.log_mel_spectrogram(audio).to(whisper_model.device)

# Визначення мови
_, probs = whisper_model.detect_language(mel)
print_with_timestamp(f"Detected language: {max(probs, key=probs.get)}")

# Розпізнавання аудіо
options = whisper.DecodingOptions()
result = whisper.decode(whisper_model, mel, options)

# Виведення розпізнаного тексту
recognized_text = result.text
print_with_timestamp(f"Recognized text: {recognized_text}")

# Функція для завантаження або завантаження та збереження моделі перекладу
def load_or_download_translation_model(model_name='Helsinki-NLP/opus-mt-en-uk', local_dir='local_model'):
    if os.path.exists(local_dir):
        tokenizer = MarianTokenizer.from_pretrained(local_dir)
        translation_model = MarianMTModel.from_pretrained(local_dir)
    else:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        translation_model = MarianMTModel.from_pretrained(model_name)
        tokenizer.save_pretrained(local_dir)
        translation_model.save_pretrained(local_dir)
    return tokenizer, translation_model

# Завантаження перекладацької моделі та токенізатора
tokenizer, translation_model = load_or_download_translation_model()

# Функція для перекладу тексту
def translate_text(text, tokenizer, model):
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    translated = model.generate(**inputs)
    translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
    return translated_text

# Переклад розпізнаного тексту
translated_text = translate_text(recognized_text, tokenizer, translation_model)
print_with_timestamp(f"Translated text: {translated_text}")


# Функція для завантаження моделі Silero
def load_silero_model(repo_or_dir='snakers4/silero-models', model_name='silero_tts', language='ua', speaker='v4_ua'):
    return torch.hub.load(repo_or_dir=repo_or_dir, model=model_name, language=language, speaker=speaker)

# Синтез голосу
model, example_text = load_silero_model()

device = torch.device('cpu')
model.to(device)
audio = model.apply_tts(text=translated_text,
                        speaker='mykyta',
                        sample_rate=48000)
print_with_timestamp("Save translated audio")

# Збереження аудіо у файл
sf.write('audio/translated_audio.wav', audio, 48000)
