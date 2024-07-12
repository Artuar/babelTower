import whisper
import torch
from transformers import MarianMTModel, MarianTokenizer

# Завантаження моделі Whisper
model = whisper.load_model("base")

# Завантаження аудіо файлу та підготовка його для розпізнавання
audio = whisper.load_audio("audio/audio.mp3")
audio = whisper.pad_or_trim(audio)

# Створення лог-Мел спектрограм та перенесення на той самий пристрій, що і модель
mel = whisper.log_mel_spectrogram(audio).to(model.device)

# Визначення мови
_, probs = model.detect_language(mel)
print(f"Detected language: {max(probs, key=probs.get)}")

# Розпізнавання аудіо
options = whisper.DecodingOptions()
result = whisper.decode(model, mel, options)

# Виведення розпізнаного тексту
recognized_text = result.text
print(f"Recognized text: {recognized_text}")

# Завантаження перекладацької моделі та токенізатора
model_name = 'Helsinki-NLP/opus-mt-en-uk'  # замініть на потрібні моделі для вашої мови
tokenizer = MarianTokenizer.from_pretrained(model_name)
translation_model = MarianMTModel.from_pretrained(model_name)

# Функція для перекладу тексту
def translate_text(text, tokenizer, model):
    inputs = tokenizer(text, return_tensors="pt", padding=True)
    translated = model.generate(**inputs)
    translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
    return translated_text

# Переклад розпізнаного тексту
translated_text = translate_text(recognized_text, tokenizer, translation_model)
print(f"Translated text: {translated_text}")
