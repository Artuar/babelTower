import { useMicrophone } from '../context/MicrophoneContext';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useEffect, useState } from 'react';
import { ProcessedData } from '../types/receivedMessages';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { Cancel } from '@mui/icons-material';

interface CallBlockProps {
  currentSession: string;
  opponentJoined: boolean;
  waitingForOpponent?: boolean;
}

export const CallBlock = ({
  currentSession,
  opponentJoined,
  waitingForOpponent,
}: CallBlockProps) => {
  const {
    initializeRecorder,
    startRecording,
    stopRecording,
    isRecording,
    destroyRecorder,
  } = useMicrophone();

  const { sendMessage, subscribe, unsubscribe } = useWebSocketContext();

  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);

  useEffect(() => {
    const handleAudioProcessed = (data: ProcessedData) => {
      setProcessedData((current) => [data, ...current]);
      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio
          .play()
          .catch((error) => console.error('Audio playback failed:', error));
      }
    };

    subscribe('conversation_audio', handleAudioProcessed);

    return () => {
      unsubscribe('conversation_audio', handleAudioProcessed);
    };
  }, []);

  useEffect(() => {
    initializeRecorder((audio: string) => {
      sendMessage({
        type: 'conversation_audio_data',
        payload: { audio, session_id: currentSession },
      });
    });

    return () => {
      destroyRecorder();
      setProcessedData([]);
    };
  }, []);

  const getContent = () => {
    if (waitingForOpponent) {
      return (
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="body1" ml={2}>
            Waiting for opponent.
          </Typography>
          <Typography variant="body1" ml={2}>
            Send your session to an opponent so they can join this conversation.
          </Typography>
        </Box>
      );
    }

    if (!opponentJoined) {
      return (
        <Box textAlign="center">
          <Cancel color="error" fontSize="large" />
          <Typography variant="body1">Opponent left this call.</Typography>
        </Box>
      );
    } else {
      return (
        <Box
          textAlign="center"
          sx={{
            opacity: isRecording ? 0.3 : 1,
            transition: 'opacity 0.3s, color 0.3s',
            '&:hover': { opacity: 1 },
          }}
        >
          <Button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? (
              <MicIcon sx={{ color: 'gray' }} fontSize="large" />
            ) : (
              <MicOffIcon sx={{ color: 'red' }} fontSize="large" />
            )}
          </Button>
          <Typography variant="body2" color="textSecondary" mt={1}>
            {isRecording ? 'You can talk.' : 'You are mute.'}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Current session is
        </Typography>
        <Typography variant="h6" mx={1} fontWeight="bold" gutterBottom>
          {currentSession}
        </Typography>
      </Box>
      <Box
        position="relative"
        bgcolor="primary.light"
        p={1}
        my={1}
        borderRadius={1}
        height={200}
        overflow="auto"
      >
        <Box
          display="flex"
          flexDirection="column"
          sx={{ opacity: isRecording ? 1 : 0.3 }}
        >
          {processedData.map((data) =>
            data.translated_text ? (
              <Typography
                key={data.timestamp}
                variant="body2"
                color="textSecondary"
                gutterBottom
              >
                {data.original_text}
              </Typography>
            ) : null,
          )}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getContent()}
        </Box>
      </Box>
    </>
  );
};
