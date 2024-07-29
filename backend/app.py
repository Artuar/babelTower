import asyncio
import json
import websockets
from flask import Flask
from flask_cors import CORS
import base64
import numpy as np
from pydub import AudioSegment
from datetime import datetime
import soundfile as sf
from io import BytesIO
from pyngrok import ngrok
import argparse
import requests

from babylon_sts import AudioProcessor

app = Flask(__name__)
CORS(app)

audio_processor = None
audio_stream = []
buffered_audio = []
last_timestamp = None

SILENCE_THRESHOLD = 500  # Adjust this value based on your requirements

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
        return {
            "timestamp": last_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "original_text": "",
            "translated_text": "",
            "synthesis_delay": 0,
            "audio": base64_audio
        }

    timestamp = datetime.utcnow()
    final_audio, log_data = audio_processor.process_audio(timestamp, combined_audio)
    audio_stream.extend(final_audio)
    output_io = BytesIO()
    sf.write(output_io, final_audio, 24000, format='mp3')
    processed_file_base64 = base64.b64encode(output_io.getvalue()).decode('utf-8')

    return {
        "timestamp": log_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
        "original_text": log_data['original_text'],
        "translated_text": log_data['translated_text'],
        "synthesis_delay": log_data['synthesis_delay'],
        "audio": processed_file_base64
    }

async def websocket_handler(websocket, path):
    global audio_processor, audio_stream, buffered_audio, last_timestamp

    async for message in websocket:
        data = json.loads(message)
        if data['type'] == 'initialize':
            language_to = data['payload'].get('language_to', 'ru')
            language_from = data['payload'].get('language_from', 'en')
            model_name = data['payload'].get('model_name', 'small')
            sample_rate = 24000

            if language_from == 'en' and model_name != 'large':
                model_name = f"{model_name}.en"

            audio_processor = AudioProcessor(language_to=language_to, language_from=language_from, model_name=model_name, sample_rate=sample_rate)
            await websocket.send(json.dumps({'type': 'initialized', 'payload': {"message": "Audio processor initialized"}}))
        elif data['type'] == 'audio_data':
            audio_data_base64 = data['payload']['audio']
            base64_audio = audio_data_base64.split(",")[1]
            audio_data = base64.b64decode(base64_audio)

            try:
                audio_segment = AudioSegment.from_file(BytesIO(audio_data), format='webm')
                raw_audio_data = audio_segment.set_frame_rate(24000).set_channels(1).set_sample_width(2).raw_data
            except Exception as e:
                print(f"Conversion error: {e}")
                await websocket.send(json.dumps({'type': 'error', 'payload': {"error": "Failed to convert audio"}}))
                return

            raw_audio_data = np.frombuffer(raw_audio_data, dtype=np.int16).tobytes()

            buffered_audio.append(raw_audio_data)
            combined_audio = b''.join(buffered_audio)

            last_timestamp = datetime.utcnow()

            frame_rate = 24000
            last_half_second_duration = int(0.5 * frame_rate * 2 * 1)
            if len(combined_audio) >= last_half_second_duration:
                last_half_second = combined_audio[-last_half_second_duration:]
                if is_silent(last_half_second):
                    result = process_buffered_audio(base64_audio)
                    await websocket.send(json.dumps({'type': 'audio_processed', 'payload': result}))
        elif data['type'] == 'translate_audio':
            file_base64 = data['payload'].get('file')
            language_to = data['payload'].get('language_to')
            language_from = data['payload'].get('language_from')
            model_name = data['payload'].get('model_name')
            sample_rate = 24000

            if not file_base64 or not language_to or not language_from:
                await websocket.send(json.dumps({'type': 'error', 'payload': {"error": "File, language_from and language_to are required"}}))
                return

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
                    language_to=language_to,
                    language_from=language_from,
                    model_name=model_name,
                    sample_rate=sample_rate
                )

                final_audio, log_data = audio_processor.process_audio(timestamp, audio_data)
                output_io = BytesIO()
                sf.write(output_io, final_audio, sample_rate, format='mp3')
                processed_file_base64 = base64.b64encode(output_io.getvalue()).decode('utf-8')
            except ValueError as e:
                print(f"Error during synthesis: {e}")
                await websocket.send(json.dumps({'type': 'error', 'payload': {"error": f"Error during synthesis: {e}"}}))
                return

            await websocket.send(json.dumps({'type': 'translated_audio', 'payload': {"translatedAudio": f"data:audio/mpeg;base64,{processed_file_base64}"}}))

async def start_server():
    server = await websockets.serve(websocket_handler, "127.0.0.1", 5000)
    print("WebSocket server is running on ws://127.0.0.1:5000")
    await server.wait_closed()

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
        tunnel = ngrok.connect(addr="127.0.0.1:{}".format("5000"), proto="http", bind_tls=True)
        public_url = tunnel.public_url
        print(" * ngrok URL:", public_url)

        # send server url to front app
        response = requests.post('https://babel-tower.vercel.app/api/server-url', json={'serverUrl': public_url})
        if response.status_code == 200:
            print("Server URL updated successfully on Next.js API")
        else:
            print("Failed to update Server URL on Next.js API")

    asyncio.run(start_server())
