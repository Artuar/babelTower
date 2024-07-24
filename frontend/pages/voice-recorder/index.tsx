import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { ProcessedData } from "./types";
import Layout from "../layout";
import { Box, Button , Container } from "@mui/material";
import { FeatureArticle } from "../../components/FeatureArticle";
import { InitialisationForm } from "../../components/InitialisationForm";
import { TranslationModel } from "../audio-translation/types";
import { Loading } from "../../components/Loading";
import { Console } from "./Console";

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
      language_to: languageTo,
      language_from: languageFrom,
      model_name: modelName
    });
    setLoading(true);
  }, [languageFrom, languageTo, modelName]);

  if (loading) {
    return  <Loading text="Recorder preparing" />
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
          {recording ? 'Stop recording' : 'Start Recording'}
        </Button>
      </Box>
      <Console processedDataList={processedData} recording={recording} />
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
            "Enhance your note-taking and subtitling process with our cutting-edge feature. Dictate your messages using your voice and instantly receive both translated text and synthesized audio in your chosen language. Perfect for creating notes or subtitles on the go, this feature ensures you capture and translate your thoughts quickly and accurately. Speak, translate, and listen with ease, making your workflow more efficient and effective."
          ]}
          imagePath="/record.png"
        />

        <VoiceRecorderContent />
      </Container>
    </Layout>
  );
};

export default VoiceRecorder;
