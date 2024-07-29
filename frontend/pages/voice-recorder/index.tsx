import { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessedData } from "../../types/types";
import Layout from "../layout";
import {Box, Container, Input, Typography} from "@mui/material";
import { FeatureArticle } from "../../components/FeatureArticle";
import { InitialisationForm } from "../../components/InitialisationForm";
import { TranslationModel } from "../../types/types";
import { Loading } from "../../components/Loading";
import { Console } from "../../components/Console";
import { Button } from "../../components/Button";
import { MicrophoneManager } from '../../helpers/MicrophoneManager';

const VoiceRecorderContent = () => {
  const [languageTo, setLanguageTo] = useState('ua');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [modelName, setModelName] = useState<TranslationModel>('small');
  const [url, setUrl] = useState<string>('http://127.0.0.1:5000');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const micManagerRef = useRef<MicrophoneManager | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const formattedUrl = url.replace("http", "ws")
    socketRef.current = new WebSocket(`${formattedUrl}/socket.io/?transport=websocket`);

    socketRef.current.onopen = function(event) {
      console.log("Connected to WebSocket server.");
    };

    socketRef.current.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'audio_processed') {
        setProcessedData((current) => ([data.payload, ...current]));
      } else if (data.type === 'error') {
        console.error(data.payload.error);
      } else if (data.type === 'initialized') {
        micManagerRef.current = new MicrophoneManager((audio) => {
          socketRef.current?.send(JSON.stringify({ type: 'audio_data', payload: { audio } }));
        });
        setIsInitialized(true);
        setLoading(false);
      }
    };

    socketRef.current.onclose = function(event) {
      console.log("Disconnected from WebSocket server.");
    };

    return () => {
      socketRef.current?.close();
    };
  }, [url]);

  const startRecording = async () => {
    await micManagerRef.current?.startRecording();
    setRecording(true);
  };

  const stopRecording = () => {
    micManagerRef.current?.stopRecording();
    setRecording(false);
  };

  const discard = () => {
    micManagerRef.current?.destroy();
    micManagerRef.current = null;
    setRecording(false);
    setIsInitialized(false);
    setProcessedData([]);
  };

  const initializeModels = useCallback(() => {
    socketRef.current?.send(JSON.stringify({
      type: 'initialize',
      payload: {
        language_to: languageTo,
        language_from: languageFrom,
        model_name: modelName
      }
    }));
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
          serverUrl={url}
          setServerUrl={setUrl}
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
