import {useMicrophone} from "../context/MicrophoneContext";
import {useWebSocketContext} from "../context/WebSocketContext";
import {useCallback, useEffect, useState} from "react";
import {JoinedSession, OpponentAction, ProcessedData} from "../types/receivedMessages";
import {ErrorBlock} from "./ErrorBlock";
import {Box, Button, Grid, Input, Typography} from "@mui/material";
import {Select} from "./Select";
import {SERVER_LINK} from "../constants/constants";
import {Loading} from "./Loading";
import {CallBlock} from "./CallBlock";

export const JoinCall = () => {
  const {
    sendMessage,
    error,
    subscribe,
    unsubscribe,
    disconnect,
    connect,
    setServerUrl,
    serverUrl,
    isConnected
  } = useWebSocketContext();

  const [currentSession, setCurrentSession] = useState("")
  const [sessionInputValue, setSessionInputValue] = useState("")
  const [opponentJoined, setOpponentJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  const discard = () => {
    setCurrentSession("")
    setSessionInputValue("")
    setOpponentJoined(false)
    setLoading(false)
    disconnect();
    connect();
  };

  const joinOpponentSession = useCallback(() => {
    sendMessage({ type: 'join_session', payload: { session_id: sessionInputValue } });
    setLoading(true)
  },[sessionInputValue])

  useEffect(() => {
    const handleJoinedSession = (data: JoinedSession) => {
      if (data.success) {
        setCurrentSession(data.session_id);
        setOpponentJoined(true);
        setLoading(false)
      } else {
        console.log("Session error");
      }
    };
    const handleOpponentLeft = (data: OpponentAction) => {
      setOpponentJoined(false)
    };

    subscribe('joined_session', handleJoinedSession);
    subscribe('opponent_left', handleOpponentLeft);

    return () => {
      unsubscribe('joined_session', handleJoinedSession);
      unsubscribe('opponent_left', handleOpponentLeft);
    };
  }, []);

  if (error) {
    return (
      <ErrorBlock
        title={'Processing error'}
        description={error}
        button="Restart"
        onClick={discard}
      />
    );
  }

  if (loading) {
    return <Loading text="Joining to session" />;
  }

  if (!currentSession) {
    return <>
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
        {
          !isConnected ?
          <Loading text="Connection to server" url={serverUrl} /> :
          <>
            <Box display="flex" alignItems="center" mt={1}>
              <Typography variant="h6">Opponent session</Typography>
              <Input sx={{ fontWeight: "bold", flex: 1, padding: 0.5 }} fullWidth value={sessionInputValue} onChange={(event) => setSessionInputValue(event.target.value)} />
            </Box>
            <Button onClick={joinOpponentSession} color="primary" disabled={sessionInputValue === currentSession} fullWidth>
              Join
            </Button>
          </>
        }
      </>
  }

  return (
    <>
      <CallBlock currentSession={currentSession} opponentJoined={opponentJoined} />
      <Box display="flex" justifyContent="space-between">
        <Button onClick={discard} color="secondary" fullWidth>
          Restart
        </Button>
      </Box>
    </>
  );
};