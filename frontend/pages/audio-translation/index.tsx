import { useState, useEffect, useMemo } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import Layout from '../layout';
import { FeatureArticle } from "../../components/FeatureArticle";
import { TranslationModel } from "./types";
import { FILE_MAX_SIZE, FILE_TYPE } from "./constants";
import { InitialisationForm } from "../../components/InitialisationForm";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/Button";

const AudioTranslationContent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [languageTo, setLanguageTo] = useState('ua');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [modelName, setModelName] = useState<TranslationModel>('small');
  const [url, setUrl] = useState<string>('http://127.0.0.1:5000');
  const [uploading, setUploading] = useState(false);
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const formattedUrl = url.replace("http", "ws")
    const socketInstance = new WebSocket(`${formattedUrl}/socket.io/?transport=websocket`);

    socketInstance.onopen = () => {
      console.log("Connected to WebSocket server.");
      setSocket(socketInstance);
    };

    socketInstance.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'translated_audio') {
        setTranslatedAudio(data.payload.translatedAudio);
        setUploading(false);
      } else if (data.type === 'error') {
        setError(data.payload.error);
        setUploading(false);
      }
    };

    socketInstance.onclose = () => {
      console.log("Disconnected from WebSocket server.");
    };

    return () => {
      socketInstance.close();
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= FILE_MAX_SIZE && file.type === FILE_TYPE) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        if (socket) {
          setUploading(true);
          const base64File = reader.result as string;
          const message = {
            type: 'translate_audio',
            payload: {
              file: base64File,
              language_to: languageTo,
              language_from: languageFrom,
              model_name: modelName,
            },
          };
          socket.send(JSON.stringify(message));
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an MP3 file under 100MB.');
    }
  };

  const handleDownload = () => {
    if (!translatedAudio) return;

    const link = document.createElement('a');
    link.href = translatedAudio;
    link.download = 'translated_audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const discard = () => {
    setSelectedFile(null);
    setUploading(false);
  };

  useMemo(() => {
    setTranslatedAudio(null);
    setError(null);
  }, [selectedFile])

  if (error) {
    return <Box mt={4} alignItems="center" flexDirection="column" display="flex">
      <Box mt={4} textAlign="center" color="error.main">
        <Typography variant="body2">{error}</Typography>
      </Box>
      <Button color="secondary" onClick={discard}>
        Try new file
      </Button>
    </Box>
  }

  if (!uploading && !translatedAudio) {
    return <>
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
              handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Typography>Drop your MP3 file here or click to upload</Typography>
            <input
              type="file"
              accept="audio/mpeg"
              style={{display: 'none'}}
              id="upload-button"
              onChange={handleFileChange}
            />
            <label htmlFor="upload-button">
              <Box
                component="span"
                sx={{mt: 2, cursor: 'pointer', color: 'primary.main', textDecoration: 'underline'}}
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
    </>
  }

  if (uploading) {
    return  <Loading text="Uploading and translating" />
  }

  if (translatedAudio) {
    return <Box mt={4} alignItems="center" flexDirection="column" display="flex">
      <Typography variant="h6" gutterBottom>
        Original Audio
      </Typography>
      {selectedFile && (
        <audio controls src={URL.createObjectURL(selectedFile)}></audio>
      )}
      <Typography variant="h6" gutterBottom sx={{mt: 2}}>
        Translated Audio
      </Typography>
      <audio controls src={translatedAudio}></audio>
      <Button onClick={handleDownload}>
        Download Translated Audio
      </Button>
      <Button color="secondary" onClick={discard}>
        Try new file
      </Button>
    </Box>
  }
};

const AudioTranslation: React.FC = () => {
  return (
    <Layout>
      <Container>
        <FeatureArticle
          title="Effortless Audio Translations"
          descriptions={[
            "Easily translate audio files with our intuitive tool. Upload your audio and receive accurate translations in no time. This feature allows users to upload their audio files and translate the conversation within them into any of the supported languages. The background sounds are preserved during the translation process, ensuring the original context and ambiance remain intact."
          ]}
          imagePath="/audio.png"
        />

        <AudioTranslationContent />
      </Container>
    </Layout>
  );
};

export default AudioTranslation;
