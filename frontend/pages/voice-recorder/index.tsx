import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://127.0.0.1:5000');

const VoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isContinue = useRef(false);
  const [translatedText, setTranslatedText] = useState<string[]>([]);
  const [originalText, setOriginalText] = useState<string[]>([]);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    socket.on('audio_processed', (data) => {
      setTranslatedText((current) => ([...current, data.translated_text]));
      setOriginalText((current) => ([...current, data.original_text]));
      const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { type: 'audio/wav' });
      setAudioURL(URL.createObjectURL(audioBlob));
    });

    socket.on('error', (data) => {
      console.error(data.error);
    });

    socket.on('initialized', async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = () => {
            socket.emit('audio_data', { audio: reader.result });
          };
        }
      };

      mediaRecorder.onstop = () => {
        if (isContinue.current) {
          startRecordingSegment(); // Restart recording
        } else {
          // Stop all tracks when recording stops
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
        }
      };

      setIsInitialized(true)
    });

    return () => {
      socket.off('audio_processed');
      socket.off('error');
      socket.off('initialized');
    };
  }, []);

  const startRecordingSegment = () => {
    const mediaRecorder = mediaRecorderRef.current;

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 250); // Record for 0.25 seconds
  };

  useEffect(() => {
    if (recording) {
      startRecordingSegment();
    } else {
      isContinue.current = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  }, [recording]);

  const startRecording = () => {
    setRecording(true);
    isContinue.current = true;
  };

  const stopRecording = () => {
    setRecording(false);
  };

  const initializeProcessor = () => {
    socket.emit('initialize', {
      language_to: 'ru',
      language_from: 'en',
      model_name: 'small'
    });
  };

  return (
    <div>
      <h1>Real-time Audio Translation with WebRTC</h1>
      <button onClick={initializeProcessor}>Initialize Processor</button>
      <button onClick={startRecording} disabled={recording || !isInitialized}>
        {recording ? 'Recording...' : 'Start Recording'}
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <h2>Original Text</h2>
      <div>{originalText.map(text => <p>{text}</p>)}</div>
      <h2>Translated Text</h2>
      <div>{translatedText.map(text => <p>{text}</p>)}</div>
      <h2>Translated Audio</h2>
      <audio controls src={audioURL}></audio>
    </div>
  );
};

export default VoiceRecorder;
