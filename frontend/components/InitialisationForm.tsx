import { useEffect } from 'react';
import { Grid, Input, MenuItem, Select, Typography } from "@mui/material";
import { TranslationModel } from "../types/types";

interface InitialisationFormProps {
  languageFrom: string
  setLanguageFrom: (language: string) => void
  languageTo: string
  setLanguageTo: (language: string) => void
  modelName: string,
  setModelName: (language: TranslationModel) => void
  serverUrl: string,
  setServerUrl: (language: string) => void
}

export const InitialisationForm: React.FC<InitialisationFormProps> = ({
  languageFrom,
  setLanguageFrom,
  languageTo,
  setLanguageTo,
  modelName,
  setModelName,
  serverUrl,
  setServerUrl
}) => {
  useEffect(() => {
    const fetchServerUrl = async () => {
      try {
        const response = await fetch('/api/server-url');
        const data = await response.json();
        setServerUrl(data.serverUrl);
      } catch (error) {
        console.error('Error fetching server URL:', error);
      }
    };

    void fetchServerUrl();
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Translation from
          </Typography>
          <Select
            value={languageFrom}
            onChange={(e) => setLanguageFrom(e.target.value as string)}
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
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Translation to
          </Typography>
          <Select
            value={languageTo}
            onChange={(e) => setLanguageTo(e.target.value as string)}
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
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Translation Model
          </Typography>
          <Select
            value={modelName}
            onChange={(e) => setModelName(e.target.value as TranslationModel)}
            fullWidth
          >
            <MenuItem value={'tiny'}>tiny</MenuItem>
            <MenuItem value={'base'}>base</MenuItem>
            <MenuItem value={'small'}>small</MenuItem>
            <MenuItem value={'medium'}>medium</MenuItem>
            <MenuItem value={'large'}>large</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <Grid item xs={12} md={4} mt={1}>
        <Typography variant="h6" gutterBottom>
          Server link
        </Typography>
        <Input
          sx={{ p: 1, border: 1, borderRadius: 1, borderColor: "rgba(0, 0, 0, 0.3)" }}
          disableUnderline
          onChange={(event) => setServerUrl(event.currentTarget.value)}
          value={serverUrl}
          fullWidth
        />
      </Grid>
    </>
  );
};
