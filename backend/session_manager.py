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
            'connection1': None,
            'user2': None,
            'processor2': None,
            'connection2': None
        }
        return session_id

    def join_session(self, session_id, user_id, processor: AudioProcessorManager, connection):
        session = self.sessions.get(session_id)
        if session and not session['user2'] and session['user1'] is not user_id:
            session['user2'] = user_id
            session['processor2'] = processor
            session['connection2'] = connection
            return True
        if session and (session['user2'] is user_id or session['user1'] is user_id):
            return True
        return False

    def get_opponent(self, session_id, user_id):
        session = self.sessions.get(session_id)
        if session:
            if session['user1'] == user_id:
                return session['connection2']
            if session['user2'] == user_id:
                return session['connection1']
        return None

    def remove_session(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]
