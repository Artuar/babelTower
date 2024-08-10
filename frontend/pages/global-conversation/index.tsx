import {Box, Button, Container, Input, Typography} from '@mui/material';
import { FeatureArticle } from '../../components/FeatureArticle';
import { Metadata } from '../../components/Metadata';
import { LayoutWithSidebar } from '../../components/LayoutWithSidebar';
import {useWebSocketContext} from "../../context/WebSocketContext";
import {useCallback, useEffect, useState} from "react";
import {JoinedSession, ProcessedData} from "../../types/receivedMessages";
import {ErrorBlock} from "../../components/ErrorBlock";
import {InitialisationForm} from "../../components/InitialisationForm";
import {Loading} from "../../components/Loading";
import {useMicrophone} from "../../context/MicrophoneContext";

const GlobalConversationContent = () => {
  const {
    initializeRecorder,
    startRecording,
    stopRecording,
    isRecording,
    destroyRecorder,
  } = useMicrophone();

  const {
    sendMessage,
    isInitialized,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
    sessionHash
  } = useWebSocketContext();

  const [processedData, setProcessedData] = useState<ProcessedData[]>([]);
  const [currentSession, setCurrentSession] = useState(sessionHash)
  const [sessionInputValue, setSessionInputValue] = useState(sessionHash)

  const discard = () => {
    disconnect();
    connect();
  };

  const canselSession = useCallback(() => {
    setSessionInputValue(sessionHash)
  }, [sessionHash])

  const joinOpponentSession = useCallback(() => {
    sendMessage({ type: 'join_session', payload: { session_id: sessionInputValue } });
  },[sessionInputValue])

  useEffect(() => {
    const handleAudioProcessed = (data: ProcessedData) => {
      setProcessedData((current) => [data, ...current]);
    };
    const handleJoinedSession = (data: JoinedSession) => {
      if (data.success) {
        setCurrentSession(data.session_id);
      } else {
        console.log("Session error");
      }
    };

    subscribe('conversation_audio', handleAudioProcessed);
    subscribe('joined_session', handleJoinedSession);

    return () => {
      unsubscribe('conversation_audio', handleAudioProcessed);
      unsubscribe('joined_session', handleJoinedSession);
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      initializeRecorder((audio: string) => {
        sendMessage({ type: 'conversation_audio_data', payload: { audio, session_id: currentSession } });
      });
    } else {
      destroyRecorder();
      setProcessedData([]);
    }
  }, [isInitialized, currentSession]);

  useEffect(() => {
    setCurrentSession(sessionHash)
    setSessionInputValue(sessionHash)
  }, [sessionHash])

  if (error) {
    return (
      <ErrorBlock
        title={isInitialized ? 'Processing error' : 'Initializing error'}
        description={error}
        button="Restart"
        onClick={discard}
      />
    );
  }

  if (!isInitialized) {
    return <InitialisationForm />;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={discard} color="secondary">
          Restart
        </Button>
        <Button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Mute' : 'Unmute'}
        </Button>
      </Box>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" gutterBottom>Current session is</Typography>
        <Input sx={{ fontWeight: "bold", flex: 1, padding: 0.5 }} fullWidth value={sessionInputValue} onChange={(event) => setSessionInputValue(event.target.value)} />
        <Button onClick={joinOpponentSession} color="primary" disabled={sessionInputValue === currentSession}>
          Join new session
        </Button>
        <Button onClick={canselSession} color="secondary" disabled={sessionInputValue === currentSession}>
          Cancel
        </Button>
      </Box>
      <Box bgcolor="primary.light" p={1} my={1} borderRadius={1}>
      {
        currentSession === sessionHash ?
          <Typography>Send your session to an opponent to they able to join this conversation. Or change it if you have session key from an opponent.</Typography> :
          <Typography>You are currently joined to an opponent conversation. Your original session is {sessionHash}</Typography>
      }
      </Box>
      <Box display="flex" flexDirection="column">
        {processedData.map(data => <audio controls src={`data:audio/mp3;base64,${data.audio}`}>
          <track kind="captions" />
        </audio>)}
      </Box>
    </>
  );
};

const GlobalConversation: React.FC = () => {
  return (
    <LayoutWithSidebar>
      <Metadata
        title="Babylon Tower - Global Conversations Made Easy"
        description="Experience seamless global communication with our real-time audio translation feature."
        keywords="speech recognition, speech synthesis, translation, audio, Babylon Tower, Global Conversations"
        image="/conversation.png"
        url="https://babel-tower.vercel.app/global-conversation"
      />
      <Container>
        <FeatureArticle
          title="Global Conversations Made Easy"
          descriptions={[
            'Experience seamless global communication with our real-time audio translation feature. Engage in conversations with people worldwide, regardless of language differences. Enjoy instant translation during your audio calls, connecting effortlessly with anyone, anywhere. Break down language barriers and foster meaningful relationships without delays or misunderstandings.',
          ]}
          imagePath="/conversation.png"
        />

        <GlobalConversationContent />
      </Container>
    </LayoutWithSidebar>
  );
};

export default GlobalConversation;
