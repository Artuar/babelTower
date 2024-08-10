import json
from audio_processing import AudioProcessorManager
import ws_messages
from session_manager import SessionManager
from utils import audio_base64_to_bytes

session_manager = SessionManager()


async def websocket_handler(websocket):
    audio_processor = AudioProcessorManager()
    user_id = websocket.id

    async for message in websocket:
        data = json.loads(message)
        if data['type'] == 'initialize':
            language_to = data['payload'].get('language_to', 'ru')
            language_from = data['payload'].get('language_from', 'en')
            model_name = data['payload'].get('model_name', 'small')

            try:
                audio_processor.initialize_processor(language_to, language_from, model_name)
                session_id = session_manager.create_session(user_id, audio_processor)
                await websocket.send(json.dumps(ws_messages.create_initialize_response(
                    "Audio processor initialized", session_id
                )))
            except Exception as e:
                print(f"Initialization error: {e}")
                await websocket.send(json.dumps(ws_messages.create_error_response(f"Initialization error: {e}")))
                return

        elif data['type'] == 'join_session':
            session_id = data['payload']['session_id']
            session = session_manager.sessions.get(session_id)
            if session:
                language_to = session['processor1'].language_from
                language_from = session['processor1'].language_to
                model_name = session['processor1'].model_name
                audio_processor = AudioProcessorManager()
                audio_processor.initialize_processor(language_to, language_from, model_name)
                success = session_manager.join_session(session_id, user_id, audio_processor)
                await websocket.send(json.dumps(ws_messages.create_join_response(success, session_id)))
            else:
                await websocket.send(json.dumps(ws_messages.create_error_response("Invalid session ID")))

        elif data['type'] == 'conversation_audio_data':
            session_id = data['payload'].get('session_id')
            audio_data_base64 = data['payload']['audio']
            base64_audio = audio_data_base64.split(",")[1]

            audio_bytes = audio_base64_to_bytes(audio_data_base64, audio_format="webm")

            result = audio_processor.collect_complete_phrase(audio_bytes)

            handled_audio = base64_audio
            if result:
                handled_audio, log_data = result
                print(log_data)

            opponent_id = session_manager.get_opponent(session_id, user_id)
            print("opponent_id", opponent_id)
            if opponent_id:
                opponent_message = ws_messages.create_opponent_audio_response(handled_audio)
                await websocket.send_to(opponent_id, json.dumps(opponent_message))

        elif data['type'] == 'audio_data':
            audio_data_base64 = data['payload']['audio']
            base64_audio = audio_data_base64.split(",")[1]

            audio_bytes = audio_base64_to_bytes(audio_data_base64, audio_format="webm")

            result = audio_processor.collect_complete_phrase(audio_bytes)

            if result:
                translated_audio, log_data = result
                result_message = ws_messages.create_audio_processed_response(translated_audio or base64_audio, log_data)
                await websocket.send(json.dumps(result_message))

        elif data['type'] == 'translate_audio':
            file_base64 = data['payload'].get('file')

            audio_data = audio_base64_to_bytes(file_base64)

            try:
                processed_file_base64, log_data = audio_processor.translate_audio(audio_data)
                log_data["timestamp"] = log_data["timestamp"].isoformat()
            except ValueError as e:
                print(f"Error during synthesis: {e}")
                await websocket.send(json.dumps(ws_messages.create_error_response(f"Error during synthesis: {e}")))
                return

            translated_audio_message = ws_messages.create_translated_audio_response(processed_file_base64, log_data)
            await websocket.send(json.dumps(translated_audio_message))
