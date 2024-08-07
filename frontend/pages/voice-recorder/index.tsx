import { useState, useEffect } from 'react';
import { Box, Container, Button } from '@mui/material';
import { FeatureArticle } from '../../components/FeatureArticle';
import { InitialisationForm } from '../../components/InitialisationForm';
import { Console } from '../../components/Console';
import { ErrorBlock } from '../../components/ErrorBlock';
import { ProcessedData } from '../../types/receivedMessages';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { Metadata } from '../../components/Metadata';
import { useMicrophone } from '../../context/MicrophoneContext';
import { LayoutWithSidebar } from '../../components/LayoutWithSidebar';

const VoiceRecorderContent = () => {
  const {
    initializeRecorder,
    startRecording,
    stopRecording,
    isRecording,
    destroyRecorder,
  } = useMicrophone();

  const {
    sendMessage,
    isInitialized,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
  } = useWebSocketContext();

  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);

  const discard = () => {
    disconnect();
    connect();
  };

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
    if (isInitialized) {
      initializeRecorder((audio: string) => {
        sendMessage({ type: 'audio_data', payload: { audio } });
      });
    } else {
      destroyRecorder();
      setProcessedData([]);
    }
  }, [isInitialized]);

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

  if (!isInitialized) {
    return <InitialisationForm />;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={discard} color="secondary">
          Restart
        </Button>
        <Button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop recording' : 'Start Recording'}
        </Button>
      </Box>
      <Console processedDataList={processedData} recording={isRecording} />
    </>
  );
};

const VoiceRecorder = () => {
  return (
    <LayoutWithSidebar>
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
    </LayoutWithSidebar>
  );
};

export default VoiceRecorder;
