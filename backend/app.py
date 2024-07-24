import ffmpeg
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from pydub import AudioSegment
from datetime import datetime, timedelta
import soundfile as sf
from io import BytesIO
from flask_socketio import SocketIO, emit

from babylon_sts import AudioProcessor

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

audio_processor = None
audio_stream = []
buffered_audio = []
last_timestamp = None

SILENCE_THRESHOLD = 300  # Adjust this value based on your requirements

@app.route('/api/translate-audio', methods=['POST'])
def translate_audio():
    try:
        data = request.json
        file_base64 = data.get('file')
        language_to = data.get('language_to')
        language_from = data.get('language_from')
        model_name = data.get('model_name')
        sample_rate = 24000

        if not file_base64 or not language_to or not language_from:
            return jsonify({"error": "File, language_from and language_to are required"}), 400

        # Decode base64 file
        file_data = base64.b64decode(file_base64.split(';base64,')[-1])
        audio_segment = AudioSegment.from_file(BytesIO(file_data), format="mp3")
        audio_segment = audio_segment.set_frame_rate(sample_rate).set_channels(1)
        audio_data = np.array(audio_segment.get_array_of_samples())
        audio_data = audio_data.tobytes()

        timestamp = datetime.utcnow()

        # Processing the audio data
        try:
            # Creating an instance of AudioProcessor with the necessary parameters
            audio_processor = AudioProcessor(
                language_to=language_to[0],
                language_from=language_from[0],
                model_name=model_name[0],
                sample_rate=sample_rate
            )

            final_audio, log_data = audio_processor.process_audio(timestamp, audio_data)
            output_io = BytesIO()
            sf.write(output_io, final_audio, sample_rate, format='mp3')
            processed_file_base64 = base64.b64encode(output_io.getvalue()).decode('utf-8')
        except ValueError as e:
            print(f"Error during synthesis: {e}")
            return jsonify({"error": f"Error during synthesis: {e}"}), 500

        return jsonify({"translatedAudio": f"data:audio/mpeg;base64,{processed_file_base64}"}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({"error": e or "Error processing the file"}), 500

@socketio.on('initialize')
def handle_initialize(data):
    global audio_processor
    language_to = data.get('language_to', 'ua')
    language_from = data.get('language_from', 'en')
    model_name = data.get('model_name', 'base')
    sample_rate = 24000

    audio_processor = AudioProcessor(language_to=language_to, language_from=language_from, model_name=model_name, sample_rate=sample_rate)
    emit('initialized', {"message": "Audio processor initialized"})

@socketio.on('audio_data')
def handle_audio_data(data):
    global audio_processor, audio_stream, buffered_audio, last_timestamp

    if audio_processor is None:
        emit('error', {"error": "Audio processor not initialized"})
        return

    audio_data_base64 = data['audio']
    base64_audio = audio_data_base64.split(",")[1]
    audio_data = base64.b64decode(base64_audio)

    # Convert audio/webm to raw PCM using ffmpeg
    try:
        process = (
            ffmpeg
            .input('pipe:0')
            .output('pipe:1', format='wav', acodec='pcm_s16le', ac=1, ar='24k')
            .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
        )
        out, _ = process.communicate(input=audio_data)
    except ffmpeg.Error as e:
        print(f"ffmpeg error: {e.stderr.decode('utf8')}")
        emit('error', {"error": "Failed to convert audio"})
        return

    raw_audio_data = np.frombuffer(out, dtype=np.int16).tobytes()

    timestamp = datetime.utcnow()
    save_raw_audio_to_file(out, f"converted_audio{timestamp}.wav", format='WAV')

    # Append new audio data to buffer
    buffered_audio.append(raw_audio_data)
    combined_audio = b''.join(buffered_audio)

    # Check the last 0.5 seconds of audio for silence
    frame_rate = 24000
    last_half_second_duration = int(0.5 * frame_rate * 2 * 1)
    if len(combined_audio) >= last_half_second_duration:
        last_half_second = combined_audio[-last_half_second_duration:]
        if is_silent(last_half_second):
            process_buffered_audio()

    last_timestamp = datetime.utcnow()

def is_silent(data_chunk):
    audio_samples = np.frombuffer(data_chunk, dtype=np.int16)
    print(np.mean(np.abs(audio_samples)), SILENCE_THRESHOLD)
    return np.mean(np.abs(audio_samples)) < SILENCE_THRESHOLD

def process_buffered_audio():
    print("PROCESS AUDIO")
    global audio_processor, buffered_audio, audio_stream

    if not buffered_audio:
        return

    combined_audio = b''.join(buffered_audio)
    buffered_audio = []

    if is_silent(combined_audio):
        print("Ignoring quiet audio segment")
        return

    final_audio, log_data = audio_processor.process_audio(datetime.utcnow(), combined_audio)
    audio_stream.extend(final_audio)
    final_audio_base64 = base64.b64encode(np.array(final_audio)).decode('utf-8')

    emit('audio_processed', {
        "timestamp": log_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
        "original_text": log_data['original_text'],
        "translated_text": log_data['translated_text'],
        "synthesis_delay": log_data['synthesis_delay'],
        "audio": final_audio_base64
    }, broadcast=True)

def save_raw_audio_to_file(audio_data, filename, format='WAV'):
    sample_rate = 24000
    audio_array = np.frombuffer(audio_data, dtype=np.int16)
    sf.write(filename, audio_array, sample_rate, format=format)

if __name__ == '__main__':
    app.run(debug=True)
    socketio.run(app, debug=True)