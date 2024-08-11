import {useWebSocketContext} from "../context/WebSocketContext";
import { useEffect, useState} from "react";
import { OpponentAction} from "../types/receivedMessages";
import {ErrorBlock} from "./ErrorBlock";
import {InitialisationForm} from "./InitialisationForm";
import {Box, Button} from "@mui/material";
import {CallBlock} from "./CallBlock";

export const CreateCall = () => {
  const {
    isInitialized,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
    sessionHash
  } = useWebSocketContext();

  const [opponentJoined, setOpponentJoined] = useState(false)
  const [showGuideText, setShowGuideText] = useState(true)

  const discard = () => {
    setOpponentJoined(false)
    setShowGuideText(true)
    disconnect();
    connect();
  };


  useEffect(() => {
    const handleOpponentJoined = (data: OpponentAction) => {
      setOpponentJoined(true)
      setShowGuideText(false)
    };
    const handleOpponentLeft = (data: OpponentAction) => {
      setOpponentJoined(false)
    };

    subscribe('opponent_joined', handleOpponentJoined);
    subscribe('opponent_left', handleOpponentLeft);

    return () => {
      unsubscribe('opponent_joined', handleOpponentJoined);
      unsubscribe('opponent_left', handleOpponentLeft);
    };
  }, []);

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
      <CallBlock currentSession={sessionHash} opponentJoined={opponentJoined} description={
        showGuideText ?
          "Send your session to an opponent to they able to join this conversation." :
          null
      } />
      <Box display="flex" justifyContent="space-between">
        <Button onClick={discard} color="secondary" fullWidth>
          Restart
        </Button>
      </Box>
    </>
  );
};