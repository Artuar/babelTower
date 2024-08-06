import json

from audio_processing import initialize_processor, collect_complete_phrase, translate_audio
from utils import audio_base64_to_bytes, create_translated_result


async def websocket_handler(websocket):
    async for message in websocket:
        data = json.loads(message)
        if data['type'] == 'initialize':
            language_to = data['payload'].get('language_to', 'ru')
            language_from = data['payload'].get('language_from', 'en')
            model_name = data['payload'].get('model_name', 'small')

            try:
                initialize_processor(language_to, language_from, model_name)
                await websocket.send(json.dumps({'type': 'initialized', 'payload': {"message": "Audio processor initialized"}}))
            except Exception as e:
                print(f"Initialization error: {e}")
                await websocket.send(json.dumps({'type': 'error', 'payload': {"error": f"Initialization error: {e}"}}))
                return

        elif data['type'] == 'audio_data':
            audio_data_base64 = data['payload']['audio']
            base64_audio = audio_data_base64.split(",")[1]

            audio_bytes = audio_base64_to_bytes(audio_data_base64, audio_format="webm")

            result = collect_complete_phrase(audio_bytes)

            if result:
                translated_audio, log_data = result
                await websocket.send(json.dumps({
                    'type': 'audio_processed',
                    'payload': create_translated_result(translated_audio or base64_audio, log_data)
                }))

        elif data['type'] == 'translate_audio':
            file_base64 = data['payload'].get('file')

            audio_data = audio_base64_to_bytes(file_base64)

            try:
                processed_file_base64, log_data = translate_audio(audio_data)

                log_data["timestamp"] = log_data["timestamp"].isoformat()

            except ValueError as e:
                print(f"Error during synthesis: {e}")
                await websocket.send(json.dumps({'type': 'error', 'payload': {"error": f"Error during synthesis: {e}"}}))
                return

            await websocket.send(json.dumps({'type': 'translated_audio', 'payload': {
                "translatedAudio": f"data:audio/mpeg;base64,{processed_file_base64}",
                "logData": log_data,
            }}))
