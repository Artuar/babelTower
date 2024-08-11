import {useMicrophone} from "../context/MicrophoneContext";
import {useWebSocketContext} from "../context/WebSocketContext";
import { useEffect, useState} from "react";
import { ProcessedData} from "../types/receivedMessages";
import {Box, Button, Typography} from "@mui/material";

interface CallBlockProps {
  currentSession: string;
  opponentJoined: boolean;
  description?: string;
}

export const CallBlock = ({
  currentSession,
  opponentJoined,
  description
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
    };

    subscribe('conversation_audio', handleAudioProcessed);

    return () => {
      unsubscribe('conversation_audio', handleAudioProcessed);
    };
  }, []);

  useEffect(() => {
    initializeRecorder((audio: string) => {
      sendMessage({ type: 'conversation_audio_data', payload: { audio, session_id: currentSession } });
    });

    return () => {
      destroyRecorder();
      setProcessedData([]);
    }
  }, []);

  return (
    <>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" gutterBottom>Current session is</Typography>
        <Typography variant="h6" mx={1} fontWeight="bold" gutterBottom>{currentSession}</Typography>
      </Box>
      <Box bgcolor="primary.light" p={1} my={1} borderRadius={1}>
        {description || (opponentJoined ?
          "You and opponent are in call. You can unmute and talk.":
          "Opponent left this call.")}
      </Box>
      <Box display="flex" flexDirection="column">
        {processedData.map(data => {
          if (!data.audio) {
            return null
          }
          return <div><audio controls key={data.timestamp} src={`data:audio/mp3;base64,${data.audio}`}>
            <track kind="captions" />
          </audio>{data.original_text}</div>
        })}
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={isRecording ? stopRecording : startRecording} fullWidth>
          {isRecording ? 'Mute' : 'Unmute'}
        </Button>
      </Box>
    </>
  );
};