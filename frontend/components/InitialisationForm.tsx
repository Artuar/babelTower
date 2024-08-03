import { useEffect } from 'react';
import { Grid, IconButton, Typography } from '@mui/material';
import { TranslationModel } from '../types/types';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  LANGUAGES,
  LOCAL_URL,
  PUBLIC_URL,
  RECORDING_MODEL,
  SERVER_LINK,
} from '../constants/constants';
import { Select } from './Select';

interface InitialisationFormProps {
  languageFrom: string;
  setLanguageFrom: (language: string) => void;
  languageTo: string;
  setLanguageTo: (language: string) => void;
  modelName: string;
  setModelName: (language: TranslationModel) => void;
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

export const InitialisationForm = ({
  languageFrom,
  setLanguageFrom,
  languageTo,
  setLanguageTo,
  modelName,
  setModelName,
  serverUrl,
  setServerUrl,
}: InitialisationFormProps) => {
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

    // void fetchServerUrl();
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
            options={LANGUAGES}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Translation to
          </Typography>
          <Select
            value={languageTo}
            onChange={(e) => setLanguageTo(e.target.value as string)}
            options={LANGUAGES}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Translation Model
          </Typography>
          <Select
            value={modelName}
            onChange={(e) => setModelName(e.target.value as TranslationModel)}
            options={RECORDING_MODEL}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} md={4} mt={1}>
        <Typography variant="h6" gutterBottom>
          Server link
          {serverUrl !== LOCAL_URL && (
            <IconButton onClick={() => window.open(PUBLIC_URL, '_blank')}>
              <OpenInNewIcon />
            </IconButton>
          )}
        </Typography>
        <Select
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value as string)}
          options={SERVER_LINK}
        />
      </Grid>
    </>
  );
};
