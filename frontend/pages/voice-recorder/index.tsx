import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { ProcessedData } from "./types";
import Layout from "../layout";
import { Box, Container } from "@mui/material";
import { FeatureArticle } from "../../components/FeatureArticle";
import { InitialisationForm } from "../../components/InitialisationForm";
import { TranslationModel } from "../audio-translation/types";
import { Loading } from "../../components/Loading";
import { Console } from "./Console";
import { Button } from "../../components/Button";
import { MicrophoneManager } from '../../helpers/MicrophoneManager';

const socket = io('http://127.0.0.1:5000');

const VoiceRecorderContent = () => {
  const [languageTo, setLanguageTo] = useState('ua');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [modelName, setModelName] = useState<TranslationModel>('small');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const micManagerRef = useRef<MicrophoneManager | null>(null);

  useEffect(() => {
    socket.on('audio_processed', (data) => {
      setProcessedData((current) => ([data, ...current]));
    });

    socket.on('error', (data) => {
      console.error(data.error);
    });

    socket.on('initialized', async () => {
      micManagerRef.current = new MicrophoneManager((audio) => {
        socket.emit('audio_data', { audio });
      });
      setIsInitialized(true);
      setLoading(false);
    });

    return () => {
      socket.off('audio_processed');
      socket.off('error');
      socket.off('initialized');
    };
  }, []);

  const startRecording = async () => {
    await micManagerRef.current.startRecording();
    setRecording(true);
  };

  const stopRecording = () => {
    micManagerRef.current.stopRecording();
    setRecording(false);
  };

  const discard = () => {
    micManagerRef.current.destroy();
    micManagerRef.current = null;
    setRecording(false);
    setIsInitialized(false);
    setProcessedData([]);
  };

  const initializeModels = useCallback(() => {
    socket.emit('initialize', {
      language_to: languageTo,
      language_from: languageFrom,
      model_name: modelName
    });
    setLoading(true);
  }, [languageFrom, languageTo, modelName]);

  if (loading) {
    return <Loading text="Recorder preparing" />;
  }

  if (!isInitialized) {
    return (
      <>
        <InitialisationForm
          languageFrom={languageFrom}
          setLanguageFrom={setLanguageFrom}
          languageTo={languageTo}
          setLanguageTo={setLanguageTo}
          modelName={modelName}
          setModelName={setModelName}
        />
        <Button onClick={initializeModels} fullWidth>
          Initialize recorder
        </Button>
      </>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={discard} color="secondary">
          Restart
        </Button>
        <Button onClick={recording ? stopRecording : startRecording}>
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
