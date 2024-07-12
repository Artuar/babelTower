import whisper

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
print(result.text)
