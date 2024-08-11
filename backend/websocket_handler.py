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
                session_manager.sessions[session_id]['connection1'] = websocket
                await websocket.send(json.dumps(ws_messages.create_initialize_response(
                    "Audio processor initialized",  session_id
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
                success = session_manager.join_session(session_id, user_id, audio_processor, websocket)
                await websocket.send(json.dumps(ws_messages.create_join_response(success, session_id)))

                opponent_connection = session_manager.get_opponent(session_id, user_id)
                if opponent_connection:
                    opponent_message = ws_messages.create_opponent_joined(session_id)
                    await opponent_connection.send(json.dumps(opponent_message))

            else:
                await websocket.send(json.dumps(ws_messages.create_error_response("Invalid session ID")))

        elif data['type'] == 'conversation_audio_data':
            session_id = data['payload'].get('session_id')
            audio_data_base64 = data['payload']['audio']
            base64_audio = audio_data_base64.split(",")[1]

            audio_bytes = audio_base64_to_bytes(audio_data_base64, audio_format="webm")

            result = audio_processor.collect_complete_phrase(audio_bytes)

            handled_audio = base64_audio
            log_data = None
            if result:
                handled_audio, log_data = result

            opponent_connection = session_manager.get_opponent(session_id, user_id)
            if opponent_connection and result:
                opponent_message = ws_messages.create_opponent_audio_response(handled_audio, log_data)
                await opponent_connection.send(json.dumps(opponent_message))

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

        elif data['type'] == 'translate_text':
            try:
                translated_audio, translated_text = audio_processor.translate_text(data['payload'].get('text'))
            except ValueError as e:
                print(f"Error during synthesis: {e}")
                await websocket.send(json.dumps(ws_messages.create_error_response(f"Error during synthesis: {e}")))
                return

            translated_text_message = ws_messages.create_translated_text_response(translated_audio, translated_text)
            await websocket.send(json.dumps(translated_text_message))

    # Handle disconnection
    for session_id, session in session_manager.sessions.items():
        if session['user1'] == user_id or session['user2'] == user_id:
            opponent_connection = session_manager.get_opponent(session_id, user_id)
            session_manager.remove_session(session_id)
            if opponent_connection:
                opponent_message = ws_messages.create_opponent_left(session_id)
                await opponent_connection.send(json.dumps(opponent_message))
            break
