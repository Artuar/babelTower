import {useState, useEffect, useRef, useCallback} from 'react';
import io from 'socket.io-client';
import { ProcessedData } from "./types";
import Layout from "../layout";
import {Box, Button, CircularProgress, Container, Typography} from "@mui/material";
import {FeatureArticle} from "../../components/FeatureArticle";
import {InitialisationForm} from "../../components/InitialisationForm";
import {TranslationModel} from "../audio-translation/types";

const socket = io('http://127.0.0.1:5000');

const VoiceRecorderContent = () => {
  const [languageTo, setLanguageTo] = useState('ua');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [modelName, setModelName] = useState<TranslationModel>('small');

  const [loading, setLoading] = useState(false);

  const [recording, setRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isContinue = useRef(false);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    socket.on('audio_processed', (data) => {
      setProcessedData((current) => ([...current, data]));
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

      setIsInitialized(true);
      setLoading(false);
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
    }, 500);
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

  const discard = () => {
    setRecording(false)
    setIsInitialized(null)
    isContinue.current = false
    setProcessedData([])
    mediaRecorderRef.current = null
    streamRef.current = null
  }

  const initializeModels = useCallback(() => {
    socket.emit('initialize', {
      language_to: languageFrom,
      language_from: languageTo,
      model_name: modelName
    });
    setLoading(true);
  }, [languageFrom, languageTo, modelName]);

  if (loading) {
    return  <Box mt={4} textAlign="center">
      <CircularProgress />
      <Typography variant="h6" mt={2}>
        Models Initialisation...
      </Typography>
    </Box>
  }

  if (!isInitialized) {
    return <>
      <InitialisationForm
        languageFrom={languageFrom}
        setLanguageFrom={setLanguageFrom}
        languageTo={languageTo}
        setLanguageTo={setLanguageTo}
        modelName={modelName}
        setModelName={setModelName}
      />
      <Button
        sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', textDecoration: 'underline', border: 'none', background: 'none' }}
        onClick={initializeModels}
        fullWidth
      >
        Initialize Models
      </Button>
    </>
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Button
          sx={{ mt: 2, cursor: 'pointer', color: 'secondary.main', textDecoration: 'underline', border: 'none', background: 'none' }}
          onClick={discard}
        >
          Restart
        </Button>
        <Button
          sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', textDecoration: 'underline', border: 'none', background: 'none' }}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? 'Recording...' : 'Start Recording'}
        </Button>
      </Box>
      <h2>Processed Data</h2>
      <div>{processedData.map((data, index) =>
        <div key={index}>
          <p>{data.timestamp}</p>
          <p>{data.synthesis_delay}</p>
          <p>{data.original_text}</p>
          <p>{data.translated_text}</p>
          <audio controls src={`data:audio/mp3;base64,${data.audio}`}></audio>
        </div>
      )}</div>
    </>
  );
};

const VoiceRecorder = () => {
  return (
    <Layout>
      <Container>
        <FeatureArticle
          title="Speak and Translate Instantly"
          descriptions={[
            "Dictate your message and receive immediate translations along with audio synthesis in your chosen language. Perfect for on-the-go conversations."
          ]}
          imagePath="/record.png"
        />

        <VoiceRecorderContent />
      </Container>
    </Layout>
  );
};

export default VoiceRecorder;
