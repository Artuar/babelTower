import sys
import audioop
import io
import os
import numpy
import pyaudio
import torch
import wave
import whisper
import yaml
import soundfile as sf
from datetime import datetime, timedelta
from queue import Queue
from threading import Thread
from time import sleep
from whisper.tokenizer import LANGUAGES
from transformers import MarianMTModel, MarianTokenizer

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

# Функція для завантаження моделі Silero TTS
def load_silero_model(repo_or_dir='snakers4/silero-models', model_name='silero_tts', language='ua', speaker='v4_ua'):
    model, example_text = torch.hub.load(repo_or_dir=repo_or_dir, model=model_name, language=language, speaker=speaker)
    return model

# Завантаження моделі Silero
silero_model = load_silero_model()
device = torch.device('cpu')
silero_model.to(device)

# Settings and constants
settings_file = "transcriber_settings.yaml"
settings = {}
if os.path.exists(settings_file):
    with open(settings_file, 'r') as f:
        settings = yaml.safe_load(f)
if settings is None:
    settings = {}

max_energy = 5000
sample_rate = 16000
chunk_size = 1024
max_int16 = 2**15

audio_model = None
loaded_audio_model = None
currently_transcribing = False
record_thread = None
data_queue = Queue()

def transcribe_callback():
    global currently_transcribing, audio_model, loaded_audio_model, record_thread, run_record_thread
    if not currently_transcribing:
        model = settings.get('speech_model', 'tiny')
        if model != "large" and settings.get('language', 'Auto') == 'en':
            model = model + ".en"

        # Only re-load the audio model if it changed.
        if (not audio_model or not loaded_audio_model) or ((audio_model and loaded_audio_model) and loaded_audio_model != model):
            device = 'cpu'
            if torch.cuda.is_available():
                device = "cuda"
            audio_model = whisper.load_model(model, device)
            loaded_audio_model = model

        device_index = int(settings.get('microphone_index', pyaudio.PyAudio().get_default_input_device_info()['index']))
        if not record_thread:
            stream = pa.open(format=pyaudio.paInt16,
                             channels=1,
                             rate=sample_rate,
                             input=True,
                             frames_per_buffer=chunk_size,
                             input_device_index=device_index)
            record_thread = Thread(target=recording_thread, args=[stream])
            run_record_thread = True
            record_thread.start()

        currently_transcribing = True
    else:
        if record_thread:
            run_record_thread = False
            record_thread.join()
            record_thread = None
        currently_transcribing = False

def recording_thread(stream: pyaudio.Stream):
    global max_energy
    while run_record_thread:
        data = stream.read(chunk_size)
        energy = audioop.rms(data, pa.get_sample_size(pyaudio.paInt16))
        if energy > max_energy:
            max_energy = energy
        data_queue.put(data)

next_transcribe_time = None
transcribe_rate_seconds = float(settings.get('transcribe_rate', 0.5))
transcribe_rate = timedelta(seconds=transcribe_rate_seconds)
max_record_time = settings.get('max_record_time', 30)
silence_time = settings.get('seconds_of_silence_between_lines', 0.5)
last_sample = bytes()
samples_with_silence = 0
phrase_start_time = None

def print_with_timestamp(text):
    date_now = datetime.now()
    if date_now is not None:
        timestamp = date_now.strftime("%Y-%m-%d %H:%M:%S")
        print(f"{timestamp}: {text}")

def main():
    global next_transcribe_time, last_sample, samples_with_silence, phrase_start_time
    transcribe_callback()
    while currently_transcribing:
        if not data_queue.empty():
            now = datetime.utcnow()
            if not next_transcribe_time:
                next_transcribe_time = now + transcribe_rate

            if now > next_transcribe_time:
                next_transcribe_time = now + transcribe_rate

                phrase_complete = False
                while not data_queue.empty():
                    data = data_queue.get()
                    energy = audioop.rms(data, pa.get_sample_size(pyaudio.paInt16))
                    if energy < settings.get('volume_threshold', 300):
                        samples_with_silence += 1
                    else:
                        samples_with_silence = 0

                    if samples_with_silence > sample_rate / chunk_size * silence_time:
                        phrase_complete = True
                        last_sample = bytes()
                        phrase_start_time = datetime.utcnow()
                    last_sample += data

                wav_file = io.BytesIO()
                wav_writer: wave.Wave_write = wave.open(wav_file, "wb")
                wav_writer.setframerate(sample_rate)
                wav_writer.setsampwidth(pa.get_sample_size(pyaudio.paInt16))
                wav_writer.setnchannels(1)
                wav_writer.writeframes(last_sample)
                wav_writer.close()

                wav_file.seek(0)
                wav_reader: wave.Wave_read = wave.open(wav_file)
                samples = wav_reader.getnframes()
                audio = wav_reader.readframes(samples)
                wav_reader.close()

                audio_as_np_int16 = numpy.frombuffer(audio, dtype=numpy.int16)
                audio_as_np_float32 = audio_as_np_int16.astype(numpy.float32)
                audio_normalised = audio_as_np_float32 / max_int16

                language = None
                if settings.get('language', 'Auto') != 'Auto':
                    language = settings.get('language', 'Auto')

                task = 'transcribe'

                result = audio_model.transcribe(audio_normalised, language=language, task=task)
                recognized_text = result['text'].strip()

                print_with_timestamp(f"Recognized text: {recognized_text}")

                translated_text = translate_text(recognized_text, tokenizer, translation_model)
                print_with_timestamp(f"Translated text: {translated_text}")

                # Синтез голосу
                audio = silero_model.apply_tts(text=translated_text,
                                               speaker='mykyta',
                                               sample_rate=48000)
                print_with_timestamp("Save translated audio")

                # Збереження аудіо у файл
                timestamp_str = phrase_start_time.strftime("%Y%m%d%H%M%S")
                os.makedirs('audio', exist_ok=True)
                sf.write(f'audio/translated_audio_{timestamp_str}.wav', audio, 48000)

                audio_length_in_seconds = samples / float(sample_rate)
                if audio_length_in_seconds > max_record_time:
                    last_sample = bytes()

        sleep(0.1)

if __name__ == "__main__":
    pa = pyaudio.PyAudio()
    try:
        main()
    except KeyboardInterrupt:
        transcribe_callback()
    finally:
        if record_thread:
            run_record_thread = False
            record_thread.join()
