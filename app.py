import whisper
from transformers import MarianMTModel, MarianTokenizer
import soundfile as sf
import torch

# Завантаження моделі Whisper
whisper_model = whisper.load_model("base")

# Завантаження аудіо файлу та підготовка його для розпізнавання
audio = whisper.load_audio("audio/audio.mp3")
audio = whisper.pad_or_trim(audio)

# Створення лог-Мел спектрограм та перенесення на той самий пристрій, що і модель
mel = whisper.log_mel_spectrogram(audio).to(whisper_model.device)

# Визначення мови
_, probs = whisper_model.detect_language(mel)
print(f"Detected language: {max(probs, key=probs.get)}")

# Розпізнавання аудіо
options = whisper.DecodingOptions()
result = whisper.decode(whisper_model, mel, options)

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

model, example_text = torch.hub.load(repo_or_dir='snakers4/silero-models',
                                     model='silero_tts',
                                     language='ua',
                                     speaker='v4_ua')

device = torch.device('cpu')
model.to(device)
audio = model.apply_tts(text=translated_text,
                        speaker='mykyta',
                        sample_rate=48000)

# Збереження аудіо у файл
sf.write('audio/translated_audio.wav', audio, 48000)
