import time
import pyaudio
import numpy as np
import torch
from transformers import AutoProcessor, SeamlessM4Tv2Model
import torchaudio
import scipy
import threading
from queue import Queue, Empty
import signal
import sys

# Initialize the model
processor = AutoProcessor.from_pretrained("facebook/seamless-m4t-v2-large")
model = SeamlessM4Tv2Model.from_pretrained("facebook/seamless-m4t-v2-large")

# Audio settings
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
SILENCE_THRESHOLD = 500
SILENCE_DURATION = 2
MIN_PHRASE_LENGTH = 0.1  # Minimum phrase length in seconds
MIN_PHRASE_LOUDNESS = 100  # Minimum phrase loudness

# Initialize PyAudio
p = pyaudio.PyAudio()

# Open stream for microphone input
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

print("Listening...")

frames = []
all_frames = []
translated_frames = []
queue = Queue()
terminate_flag = threading.Event()

def is_silent(data_chunk):
    return np.mean(np.abs(np.frombuffer(data_chunk, dtype=np.int16))) < SILENCE_THRESHOLD

def process_audio(queue, terminate_flag):
    while not terminate_flag.is_set():
        try:
            audio_data, timestamp = queue.get(timeout=1)
            print(f"Audio taken from queue. Timestamp: {timestamp}")
        except Empty:
            continue

        if audio_data is None:
            break

        start_process_time = time.time()
        audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)

        if len(audio_array) < 3:
            print("Audio data is too short to process.")
            continue

        audio_tensor = torch.tensor(audio_array).unsqueeze(0)
        audio_tensor = torchaudio.functional.resample(audio_tensor, orig_freq=RATE, new_freq=16000)

        audio_inputs = processor(audios=audio_tensor, return_tensors="pt", sampling_rate=16000)
        audio_array_from_audio = model.generate(**audio_inputs, tgt_lang="ukr")[0].cpu().numpy().squeeze()

        print(f"Generated translation for the audio. Timestamp: {timestamp}")
        translated_frames.append(audio_array_from_audio)
        end_process_time = time.time()
        delay = end_process_time - timestamp
        print(f"Translation added to the translation stream. Timestamp: {timestamp}. Delay: {delay} seconds")

# Start audio processing thread
processing_thread = threading.Thread(target=process_audio, args=(queue, terminate_flag))
processing_thread.start()

def signal_handler(sig, frame):
    print('Interrupt received, stopping...')
    terminate_flag.set()
    stream.stop_stream()
    stream.close()
    p.terminate()
    queue.put((None, None))
    processing_thread.join()

    # Save all translated audio to a file upon program termination
    if translated_frames:
        print("Saving all translated audio...")
        translated_audio = np.concatenate(translated_frames)
        scipy.io.wavfile.write("audio/translated_audio.wav", rate=16000, data=translated_audio)
    else:
        print("No translated audio to save.")

    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

try:
    while True:
        data = stream.read(CHUNK)
        frames.append(data)
        all_frames.append(data)

        if is_silent(data):
            silence_start = time.time()
            while is_silent(data) and time.time() - silence_start < SILENCE_DURATION:
                data = stream.read(CHUNK)
                frames.append(data)
                all_frames.append(data)
            if time.time() - silence_start >= SILENCE_DURATION:
                phrase_length = len(frames) * CHUNK / RATE
                phrase_loudness = np.mean([np.abs(np.frombuffer(frame, dtype=np.int16)).mean() for frame in frames])
                if phrase_length >= MIN_PHRASE_LENGTH and phrase_loudness >= MIN_PHRASE_LOUDNESS:
                    timestamp = time.time()
                    print(f"Audio added to queue. Timestamp: {timestamp}")
                    audio_data = b''.join(frames)
                    queue.put((audio_data, timestamp))
                frames = []
except KeyboardInterrupt:
    signal_handler(None, None)
