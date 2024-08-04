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

const AudioTranslationContent: React.FC = () => {
  const { languageTo, languageFrom, modelName } = useModelInitialization();

  const {
    serverUrl,
    sendMessage,
    isConnected,
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
  }, [serverUrl]);

  const handleFileChange = async (base64File: string) => {
    setUploading(true);
    setOriginalAudio(base64File);
    sendMessage({
      type: 'translate_audio',
      payload: {
        file: base64File,
        language_to: languageTo,
        language_from: languageFrom,
        model_name: modelName,
      },
    });
  };

  const handleDownload = useCallback(() => {
    downloadFile(translatedAudio, 'translated_audio.mp3');
  }, [translatedAudio]);

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

  if (!uploading && !translatedAudio) {
    return (
      <>
        <InitialisationForm />

        {!isConnected ? (
          <Loading text="Connection to server" url={serverUrl} />
        ) : (
          <FileDragAndDrop onFileSelected={handleFileChange} />
        )}
      </>
    );
  }

  if (uploading) {
    return <Loading text="Uploading and translating" />;
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
        <Button color="secondary" onClick={discard}>
          Try new file
        </Button>
      </Box>
    );
  }
};

const AudioTranslation: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default AudioTranslation;
