import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import Layout from '../layout';
import { FeatureArticle } from '../../components/FeatureArticle';
import { TranslationModel } from '../../types/types';
import { FILE_MAX_SIZE, FILE_TYPE } from '../../constants/constants';
import { InitialisationForm } from '../../components/InitialisationForm';
import { Loading } from '../../components/Loading';
import { ErrorBlock } from '../../components/ErrorBlock';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { TranslatedAudio } from '../../types/receivedMessages';
import { downloadFile } from '../../helpers/downloadFile';

const AudioTranslationContent: React.FC = () => {
  const [languageTo, setLanguageTo] = useState('ua');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [modelName, setModelName] = useState<TranslationModel>('small');
  const {
    serverUrl,
    setServerUrl,
    sendMessage,
    isConnected,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
  } = useWebSocketContext();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);

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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.size <= FILE_MAX_SIZE && file.type === FILE_TYPE) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setUploading(true);
        const base64File = reader.result as string;
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
      reader.readAsDataURL(file);
    } else {
      alert('Please select an MP3 file under 10MB.');
    }
  };

  const handleDownload = useCallback(() => {
    downloadFile(translatedAudio, 'translated_audio.mp3');
  }, [translatedAudio]);

  const discard = () => {
    setSelectedFile(null);
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
        <InitialisationForm
          languageFrom={languageFrom}
          setLanguageFrom={setLanguageFrom}
          languageTo={languageTo}
          setLanguageTo={setLanguageTo}
          modelName={modelName}
          setModelName={setModelName}
          serverUrl={serverUrl}
          setServerUrl={setServerUrl}
        />

        {!isConnected ? (
          <Loading text="Connection to server" />
        ) : (
          <Grid container paddingY={4}>
            <Grid item xs={12}>
              <Box
                p={2}
                height="200px"
                border="1px dashed grey"
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange(
                    e as unknown as React.ChangeEvent<HTMLInputElement>,
                  );
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Typography>
                  Drop your MP3 file here or click to upload
                </Typography>
                <input
                  type="file"
                  accept="audio/mpeg"
                  style={{ display: 'none' }}
                  id="upload-button"
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-button">
                  <Box
                    component="span"
                    sx={{
                      mt: 2,
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    }}
                  >
                    Choose File
                  </Box>
                </label>
                {selectedFile && (
                  <Typography variant="body2" mt={2}>
                    Selected file: {selectedFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
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
        {selectedFile && (
          <audio controls src={URL.createObjectURL(selectedFile)}>
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
    <Layout>
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
    </Layout>
  );
};

export default AudioTranslation;
