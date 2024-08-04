import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Container, Button } from '@mui/material';
import { FeatureArticle } from '../../components/FeatureArticle';
import { InitialisationForm } from '../../components/InitialisationForm';
import { Loading } from '../../components/Loading';
import { Console } from '../../components/Console';
import { MicrophoneManager } from '../../helpers/MicrophoneManager';
import { ErrorBlock } from '../../components/ErrorBlock';
import { ProcessedData } from '../../types/receivedMessages';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { Metadata } from '../../components/Metadata';
import { useModelInitialization } from '../../context/ModelInitializationContext';

const VoiceRecorderContent: React.FC = () => {
  const { languageTo, languageFrom, modelName } = useModelInitialization();

  const {
    serverUrl,
    sendMessage,
    isInitialized,
    isConnected,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
  } = useWebSocketContext();

  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const micManagerRef = useRef<MicrophoneManager | null>(null);

  useEffect(() => {
    const handleAudioProcessed = (data: ProcessedData) => {
      setProcessedData((current) => [data, ...current]);
    };

    subscribe('audio_processed', handleAudioProcessed);

    return () => {
      unsubscribe('audio_processed', handleAudioProcessed);
    };
  }, []);

  useEffect(() => {
    setLoading(false);

    if (isInitialized) {
      micManagerRef.current = new MicrophoneManager((audio: string) => {
        sendMessage({ type: 'audio_data', payload: { audio } });
      });
    } else {
      micManagerRef.current?.destroy();
      micManagerRef.current = null;
      setRecording(false);
      setProcessedData([]);
    }
  }, [isInitialized]);

  const startRecording = async () => {
    await micManagerRef.current?.startRecording();
    setRecording(true);
  };

  const stopRecording = () => {
    micManagerRef.current?.stopRecording();
    setRecording(false);
  };

  const discard = () => {
    disconnect();
    connect();
  };

  const initializeModels = useCallback(() => {
    sendMessage({
      type: 'initialize',
      payload: {
        language_to: languageTo,
        language_from: languageFrom,
        model_name: modelName,
      },
    });
    setLoading(true);
  }, [languageFrom, languageTo, modelName, sendMessage]);

  if (error) {
    return (
      <ErrorBlock
        title={isInitialized ? 'Processing error' : 'Initializing error'}
        description={error}
        button="Restart"
        onClick={discard}
      />
    );
  }

  if (loading) {
    return <Loading text="Recorder preparing" />;
  }

  if (!isInitialized) {
    return (
      <>
        <InitialisationForm />
        {isConnected ? (
          <Button onClick={initializeModels} fullWidth>
            Initialize recorder
          </Button>
        ) : (
          <Loading text="Connection to server" url={serverUrl} />
        )}
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
    <>
      <Metadata
        title="Babylon Tower - Speak and Translate Instantly"
        description="Dictate your messages using your voice and instantly receive both translated text and synthesized audio in your chosen language."
        keywords="speech recognition, speech synthesis, translation, audio, Babylon Tower, Voice recorder"
        image="/record.png"
        url="https://babel-tower.vercel.app/voice-recorder"
      />
      <Container>
        <FeatureArticle
          title="Speak and Translate Instantly"
          descriptions={[
            'Enhance your note-taking and subtitling process with our cutting-edge feature. Dictate your messages using your voice and instantly receive both translated text and synthesized audio in your chosen language. Perfect for creating notes or subtitles on the go, this feature ensures you capture and translate your thoughts quickly and accurately. Speak, translate, and listen with ease, making your workflow more efficient and effective.',
          ]}
          imagePath="/record.png"
        />
        <VoiceRecorderContent />
      </Container>
    </>
  );
};

export default VoiceRecorder;
