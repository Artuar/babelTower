import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { FeatureArticle } from '../../components/FeatureArticle';
import { InitialisationForm } from '../../components/InitialisationForm';
import { Loading } from '../../components/Loading';
import { ErrorBlock } from '../../components/ErrorBlock';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { TranslatedAudio } from '../../types/receivedMessages';
import { downloadFile } from '../../helpers/downloadFile';
import FileDragAndDrop from '../../components/FileDragAndDrop';
import { Metadata } from '../../components/Metadata';
import { useModelInitialization } from '../../context/ModelInitializationContext';
import LayoutWithSidebar from "../../components/LayoutWithSidebar";

const AudioTranslationContent: React.FC = () => {
  const { languageTo, languageFrom, modelName } = useModelInitialization();

  const {
    serverUrl,
    sendMessage,
    isConnected,
    isInitialized,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
  } = useWebSocketContext();

  const [uploading, setUploading] = useState(false);
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);
  const [originalAudio, setOriginalAudio] = useState<string | null>(null);

  useEffect(() => {
    const handleAudioProcessed = (data: TranslatedAudio) => {
      setTranslatedAudio(data.translatedAudio);
      setUploading(false);
    };

    subscribe('translated_audio', handleAudioProcessed);

    return () => {
      unsubscribe('translated_audio', handleAudioProcessed);
    };
  }, []);

  const handleFileChange = async (base64File: string) => {
    setOriginalAudio(base64File);
  };

  const initializeModels = () => {
    setUploading(true);
    sendMessage({
      type: 'initialize',
      payload: {
        language_to: languageTo,
        language_from: languageFrom,
        model_name: modelName,
      },
    });
  }

  const handleDownload = useCallback(() => {
    downloadFile(translatedAudio, 'translated_audio.mp3');
  }, [translatedAudio]);

  useEffect(() => {
    setUploading(false);
    if (!isInitialized) {
      setOriginalAudio(null);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (!originalAudio) {
      return
    }

    setUploading(true);

    sendMessage({
      type: 'translate_audio',
      payload: {
        file: originalAudio,
      },
    });
  }, [originalAudio])

  const discardAudio = () => {
    setUploading(false);
    setTranslatedAudio(null);
  }

  const discard = () => {
    setUploading(false);
    setTranslatedAudio(null);
    disconnect();
    connect();
  };

  if (error) {
    return (
      <ErrorBlock
        title="Processing error"
        description={error}
        button="Try new file"
        onClick={discard}
      />
    );
  }

  if (uploading) {
    return <Loading text={isInitialized ? "Uploading and translating" : "Models initialization"} />;
  }

  if (!isInitialized) {
    return (
      <>
        <InitialisationForm />
        {isConnected ? (
          <Button onClick={initializeModels} fullWidth>
            Initialize models
          </Button>
        ) : (
          <Loading text="Connection to server" url={serverUrl} />
        )}
      </>
    );
  }

  if (translatedAudio) {
    return (
      <Box mt={4} alignItems="center" flexDirection="column" display="flex">
        <Typography variant="h6" gutterBottom>
          Original Audio
        </Typography>
        {originalAudio && (
          <audio controls src={originalAudio}>
            <track kind="captions" />
          </audio>
        )}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Translated Audio
        </Typography>
        <audio controls src={translatedAudio}>
          <track kind="captions" />
        </audio>
        <Button onClick={handleDownload}>Download Translated Audio</Button>
        <Button color="secondary" onClick={discardAudio}>
          Try new file
        </Button>
      </Box>
    );
  }

  return <FileDragAndDrop onFileSelected={handleFileChange} />

};

const AudioTranslation: React.FC = () => {
  return (
    <LayoutWithSidebar>
      <Metadata
        title="Babylon Tower - Effortless Audio Translations"
        description="Easily translate audio files with our intuitive tool."
        keywords="speech recognition, speech synthesis, translation, audio, Babylon Tower, Audio Translations"
        image="/audio.png"
        url="https://babel-tower.vercel.app/audio-translation"
      />
      <Container>
        <FeatureArticle
          title="Effortless Audio Translations"
          descriptions={[
            'Easily translate audio files with our intuitive tool. Upload your audio and receive accurate translations in no time. This feature allows users to upload their audio files and translate the conversation within them into any of the supported languages. The background sounds are preserved during the translation process, ensuring the original context and ambiance remain intact.',
          ]}
          imagePath="/audio.png"
        />
        <AudioTranslationContent />
      </Container>
    </LayoutWithSidebar>
  );
};

export default AudioTranslation;
