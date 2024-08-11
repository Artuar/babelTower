import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, TextField } from '@mui/material';
import { FeatureArticle } from '../../components/FeatureArticle';
import { InitialisationForm } from '../../components/InitialisationForm';
import { Loading } from '../../components/Loading';
import { ErrorBlock } from '../../components/ErrorBlock';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { TranslatedAudio } from '../../types/receivedMessages';
import { downloadFile } from '../../helpers/downloadFile';
import { Metadata } from '../../components/Metadata';
import { LayoutWithSidebar } from '../../components/LayoutWithSidebar';

const TextTranslatorContent: React.FC = () => {
  const {
    sendMessage,
    isInitialized,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
  } = useWebSocketContext();

  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleTextProcessed = (data: TranslatedAudio) => {
      setTranslatedAudio(data.translatedAudio);
      setLoading(false);
    };

    subscribe('translated_text', handleTextProcessed);

    return () => {
      unsubscribe('translated_text', handleTextProcessed);
    };
  }, []);

  const translateText = useCallback(() => {
    setLoading(true);
    sendMessage({
      type: 'translate_text',
      payload: {
        text,
      },
    });
  }, [text]);

  const handleDownload = useCallback(() => {
    downloadFile(translatedAudio, 'translated_audio.mp3');
  }, [translatedAudio]);

  const discard = () => {
    setText("");
    setTranslatedText("");
    setTranslatedAudio(null);
    setLoading(false);
    disconnect();
    connect();
  };

  if (error) {
    return (
      <ErrorBlock
        title="Processing error"
        description={error}
        button="Restart"
        onClick={discard}
      />
    );
  }

  if (!isInitialized) {
    return <InitialisationForm />;
  }

  if (loading) {
    return <Loading text="Translating" />;
  }

  return (
    <Box mt={4} flexDirection="column" display="flex">
      <TextField
        label="Enter text to translate"
        multiline
        rows={4}
        variant="outlined"
        value={text}
        onChange={(e) => {
          const newText = e.target.value;
          if (newText.length <= 1000) {
            setText(newText);
          }
        }}
        fullWidth
        margin="normal"
        helperText={`${text.length}/1000 characters`}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={translateText}
        disabled={!text}
      >
        Translate Text
      </Button>

      {translatedText && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Translated text
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
            {translatedText}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Translated Audio
          </Typography>
          <Box display="flex">
            <audio controls src={translatedAudio}>
              <track kind="captions" />
            </audio>
            <Button onClick={handleDownload}>Download Translated Audio</Button>
            <Button color="secondary" onClick={discard}>
              Restart
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

const AudioTranslation: React.FC = () => {
  return (
    <LayoutWithSidebar>
      <Metadata
        title="Babylon Tower - Text-to-Voice Translator"
        description="Transform written text into spoken translation in just seconds."
        keywords="speech synthesis, translation, text translation, Babylon Tower"
        image="/writer.png"
        url="https://babel-tower.vercel.app/text-translator"
      />
      <Container>
        <FeatureArticle
          title="Text-to-Voice Translator"
          descriptions={[
            'Transform written text into spoken translation in just seconds. Enter any text, choose your target language, and instantly receive a synthesized voice translation. Perfect for quickly generating audio in your desired language for learning, work, or simply for fun. Enjoy clear, natural-sounding translations anytime, anywhere.',
          ]}
          imagePath="/writer.png"
        />
        <TextTranslatorContent />
      </Container>
    </LayoutWithSidebar>
  );
};

export default AudioTranslation;
