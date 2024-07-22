import { useState } from 'react';
import { Box, Container, Grid, MenuItem, Select, Typography, CircularProgress, Button } from '@mui/material';
import Layout from '../layout';
import { FeatureArticle } from "../../components/FeatureArticle";

const AudioTranslationContent: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('en');
  const [uploading, setUploading] = useState(false);
  const [translatedAudio, setTranslatedAudio] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 100 * 1024 * 1024 && file.type === 'audio/mpeg') {
      setSelectedFile(file);
      setTranslatedAudio(null);

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      try {
        const response = await fetch('/api/translate-audio', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setTranslatedAudio(data.translatedAudio);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploading(false);
      }
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
    setUploading(null)
    setTranslatedAudio(null)
  };

  if (!uploading && !translatedAudio) {
      return <>
        <Grid container display="flex">
          <Typography variant="h6" gutterBottom>
            Translation Language
          </Typography>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as string)}
            fullWidth
          >
            <MenuItem value={'en'}>English</MenuItem>
            <MenuItem value={'ua'}>Українська</MenuItem>
            <MenuItem value={'ru'}>Русский</MenuItem>
            <MenuItem value={'fr'}>Français</MenuItem>
            <MenuItem value={'de'}>Deutsch</MenuItem>
            <MenuItem value={'es'}>Español</MenuItem>
            <MenuItem value={'hi'}>हिन्दी</MenuItem>
          </Select>
        </Grid>
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
    return  <Box mt={4} textAlign="center">
      <CircularProgress />
      <Typography variant="body2" mt={2}>
        Uploading and translating...
      </Typography>
    </Box>
  }

  if (translatedAudio) {
    return <Box mt={4} alignItems="center" flexDirection="column" display="flex">
      <Typography variant="h6" gutterBottom>
        Translated Audio
      </Typography>
      <audio controls src={translatedAudio}></audio>
      <Button
        sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', textDecoration: 'underline', border: 'none', background: 'none' }}
        onClick={handleDownload}
      >
        Download Translated Audio
      </Button>
      <Button
        sx={{ mt: 2, cursor: 'pointer', color: 'secondary.main', textDecoration: 'underline', border: 'none', background: 'none' }}
        onClick={discard}
      >
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
