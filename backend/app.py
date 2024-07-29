from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from pydub import AudioSegment
from datetime import datetime
import soundfile as sf
from io import BytesIO
from flask_socketio import SocketIO, emit
from pyngrok import ngrok
import argparse

from babylon_sts import AudioProcessor

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

audio_processor = None
audio_stream = []
buffered_audio = []
last_timestamp = None

SILENCE_THRESHOLD = 500  # Adjust this value based on your requirements

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
    language_to = data.get('language_to', 'ru')
    language_from = data.get('language_from', 'en')
    model_name = data.get('model_name', 'small')
    sample_rate = 24000

    if language_from == 'en' and model_name != 'large':
        model_name = f"{model_name}.en"

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

    try:
        audio_segment = AudioSegment.from_file(BytesIO(audio_data), format='webm')
        raw_audio_data = audio_segment.set_frame_rate(24000).set_channels(1).set_sample_width(2).raw_data
    except Exception as e:
        print(f"Conversion error: {e}")
        emit('error', {"error": "Failed to convert audio"})
        return

    raw_audio_data = np.frombuffer(raw_audio_data, dtype=np.int16).tobytes()

    # Append new audio data to buffer
    buffered_audio.append(raw_audio_data)
    combined_audio = b''.join(buffered_audio)

    last_timestamp = datetime.utcnow()

    # Check the last 0.5 seconds of audio for silence
    frame_rate = 24000
    last_half_second_duration = int(0.5 * frame_rate * 2 * 1)
    if len(combined_audio) >= last_half_second_duration:
        last_half_second = combined_audio[-last_half_second_duration:]
        if is_silent(last_half_second):
            process_buffered_audio(base64_audio)


def is_silent(data_chunk):
    audio_samples = np.frombuffer(data_chunk, dtype=np.int16)
    return np.mean(np.abs(audio_samples)) < SILENCE_THRESHOLD


def process_buffered_audio(base64_audio: str):
    global audio_processor, buffered_audio, audio_stream

    if not buffered_audio:
        return

    combined_audio = b''.join(buffered_audio)
    buffered_audio = []

    if is_silent(combined_audio):
        emit('audio_processed', {
            "timestamp": last_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "original_text": "",
            "translated_text": "",
            "synthesis_delay": 0,
            "audio": base64_audio
        }, broadcast=True)
        return

    timestamp = datetime.utcnow()
    # save_raw_audio_to_file(combined_audio, f"combined_audio{timestamp}.wav", format='WAV')

    final_audio, log_data = audio_processor.process_audio(timestamp, combined_audio)
    audio_stream.extend(final_audio)
    output_io = BytesIO()
    sf.write(output_io, final_audio, 24000, format='mp3')
    processed_file_base64 = base64.b64encode(output_io.getvalue()).decode('utf-8')

    emit('audio_processed', {
        "timestamp": log_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
        "original_text": log_data['original_text'],
        "translated_text": log_data['translated_text'],
        "synthesis_delay": log_data['synthesis_delay'],
        "audio": processed_file_base64
    }, broadcast=True)

def save_raw_audio_to_file(audio_data, filename, format='WAV'):
    sample_rate = 24000
    audio_array = np.frombuffer(audio_data, dtype=np.int16)
    sf.write(filename, audio_array, sample_rate, format=format)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run Babylon Tower application.')
    parser.add_argument('--port', type=int, default=5000, help='Port number')
    parser.add_argument('--ngrok_token', type=str, default="", help='NGROK token')
    parser.add_argument('--is_debug', type=int, default=1, help='Use debug mode')
    args = parser.parse_args()

    PORT = args.port
    NGROK_TOKEN = args.ngrok_token
    IS_DEBUG = args.is_debug

    if NGROK_TOKEN:
        ngrok.set_auth_token(NGROK_TOKEN)
        # Close existing tunnels to avoid error
        for tunnel in ngrok.get_tunnels():
            ngrok.disconnect(tunnel.public_url)
        # run ngrok tunnel
        public_url = ngrok.connect(PORT)
        print(" * ngrok URL:", public_url)

    app.run(debug=IS_DEBUG, port=PORT)
    socketio.run(app, debug=IS_DEBUG, port=PORT)
