import { Button, Grid, Typography } from '@mui/material';
import { TranslationModel } from '../types/types';
import {
  LANGUAGES,
  RECORDING_MODEL,
  SERVER_LINK,
} from '../constants/constants';
import { Select } from './Select';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useModelInitialization } from '../context/ModelInitializationContext';
import { Loading } from './Loading';
import { useCallback, useEffect, useState } from 'react';

export const InitialisationForm = () => {
  const [loading, setLoading] = useState(false);
  const { setServerUrl, serverUrl, isConnected, sendMessage, isInitialized } =
    useWebSocketContext();
  const {
    languageTo,
    languageFrom,
    modelName,
    setLanguageTo,
    setLanguageFrom,
    setModelName,
  } = useModelInitialization();

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
  }, [languageFrom, languageTo, modelName]);

  useEffect(() => {
    setLoading(false);
  }, [isInitialized]);

  if (loading) {
    return <Loading text="Models initialization" />;
  }

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
        </Typography>
        <Select
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value as string)}
          options={SERVER_LINK}
        />
      </Grid>
      {isConnected ? (
        <Button onClick={initializeModels} fullWidth>
          Initialize recorder
        </Button>
      ) : (
        <Loading text="Connection to server" url={serverUrl} />
      )}
    </>
  );
};
