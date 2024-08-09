import uuid
from typing import Dict

from audio_processing import AudioProcessorManager


class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}

    def create_session(self, user_id, processor: AudioProcessorManager):
        session_id = uuid.uuid4().hex
        self.sessions[session_id] = {
            'user1': user_id,
            'processor1': processor,
            'user2': None,
            'processor2': None
        }
        return session_id

    def join_session(self, session_id, user_id, processor: AudioProcessorManager):
        session = self.sessions.get(session_id)
        if session and not session['user2']:
            session['user2'] = user_id
            session['processor2'] = processor
            return True
        return False

    def get_opponent(self, session_id, user_id):
        session = self.sessions.get(session_id)
        if session:
            if session['user1'] == user_id:
                return session['user2']
            if session['user2'] == user_id:
                return session['user1']
        return None
